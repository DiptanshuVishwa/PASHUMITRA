require('dotenv').config();
const axios = require('axios');
const emailService = require('../services/emailService');
const User = require('../models/User');
const mongoose = require('mongoose');
const crypto = require('crypto');

class EmailVerificationTester {
  constructor() {
    this.baseUrl = 'http://localhost:5000/api';
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async connectToDatabase() {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB');
      return true;
    } catch (error) {
      console.log('❌ MongoDB connection failed:', error.message);
      return false;
    }
  }

  logTest(testName, success, message, data = {}) {
    const result = {
      test: testName,
      success,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    
    this.testResults.tests.push(result);
    
    if (success) {
      this.testResults.passed++;
      console.log(`✅ ${testName}: ${message}`);
    } else {
      this.testResults.failed++;
      console.log(`❌ ${testName}: ${message}`);
    }
    
    if (Object.keys(data).length > 0) {
      console.log(`   Data:`, data);
    }
  }

  async testDirectEmailSending() {
    console.log('\n📧 Testing Direct Email Sending...');
    
    try {
      const result = await emailService.sendEmail({
        to: process.env.EMAIL_FROM,
        subject: '🧪 Direct Email Test - PashuMitra',
        htmlContent: `
          <h2>Direct Email Test</h2>
          <p>This is a test of the direct email sending functionality.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        `,
        textContent: `Direct Email Test\\n\\nThis is a test of the direct email sending functionality.\\nTimestamp: ${new Date().toISOString()}`
      });

      if (result.success) {
        this.logTest('Direct Email Send', true, 'Email sent successfully', {
          messageId: result.messageId
        });
        return true;
      } else {
        this.logTest('Direct Email Send', false, 'Email sending failed', {
          error: result.error
        });
        return false;
      }
    } catch (error) {
      this.logTest('Direct Email Send', false, 'Exception occurred', {
        error: error.message
      });
      return false;
    }
  }

  async testEmailVerificationFunction() {
    console.log('\n📧 Testing Email Verification Function...');
    
    try {
      const testUser = {
        name: 'Verification Test User',
        email: process.env.EMAIL_FROM
      };
      const testToken = crypto.randomBytes(20).toString('hex');
      
      const result = await emailService.sendEmailVerification(testUser, testToken);
      
      if (result.success) {
        this.logTest('Email Verification Function', true, 'Verification email sent', {
          messageId: result.messageId,
          verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${testToken}`
        });
        return true;
      } else {
        this.logTest('Email Verification Function', false, 'Verification email failed', {
          error: result.error
        });
        return false;
      }
    } catch (error) {
      this.logTest('Email Verification Function', false, 'Exception occurred', {
        error: error.message
      });
      return false;
    }
  }

  async testUserRegistrationFlow() {
    console.log('\n👤 Testing User Registration Flow...');
    
    try {
      const testUser = {
        name: 'Test User Registration',
        email: `test_${Date.now()}@example.com`,
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        userType: 'farmer',
        phoneNumber: '+91-9876543210',
        location: {
          state: 'Karnataka',
          district: 'Bangalore',
          village: 'Test Village'
        }
      };

      const response = await axios.post(`${this.baseUrl}/auth/register`, testUser);
      
      if (response.status === 201 && response.data.success) {
        this.logTest('User Registration', true, 'User registered successfully', {
          userId: response.data.data?.user?.id || response.data.data?.user?._id,
          hasToken: !!response.data.token
        });
        
        // Clean up test user
        if (response.data.data?.user?._id) {
          await User.findByIdAndDelete(response.data.data.user._id);
        }
        
        return true;
      } else {
        this.logTest('User Registration', false, 'Registration failed', {
          status: response.status,
          data: response.data
        });
        return false;
      }
      
    } catch (error) {
      if (error.response) {
        this.logTest('User Registration', false, 'Registration API error', {
          status: error.response.status,
          error: error.response.data?.message || error.response.statusText
        });
      } else if (error.code === 'ECONNREFUSED') {
        this.logTest('User Registration', false, 'Cannot connect to backend server', {
          suggestion: 'Make sure backend server is running on port 5000'
        });
      } else {
        this.logTest('User Registration', false, 'Network error', {
          error: error.message
        });
      }
      return false;
    }
  }

  async testEmailVerificationEndpoint() {
    console.log('\n🔐 Testing Email Verification Endpoint...');
    
    try {
      // Create a test user with verification token
      const testUser = new User({
        name: 'Test Verification User',
        email: `verify_test_${Date.now()}@example.com`,
        password: 'TestPassword123!',
        role: 'user',
        emailVerified: false
      });
      
      const verificationToken = testUser.getEmailVerificationToken();
      await testUser.save({ validateBeforeSave: false });
      
      // Test email verification
      const response = await axios.post(`${this.baseUrl}/auth/verify-email`, {
        token: verificationToken
      });
      
      if (response.status === 200 && response.data.success) {
        this.logTest('Email Verification Endpoint', true, 'Email verified successfully', {
          userId: testUser._id,
          message: response.data.message
        });
        
        // Verify user is actually verified in database
        const verifiedUser = await User.findById(testUser._id);
        if (verifiedUser && verifiedUser.emailVerified) {
          this.logTest('Database Verification Update', true, 'User verification status updated in database');
        } else {
          this.logTest('Database Verification Update', false, 'User verification status not updated in database');
        }
        
        // Clean up
        await User.findByIdAndDelete(testUser._id);
        return true;
        
      } else {
        this.logTest('Email Verification Endpoint', false, 'Verification failed', {
          status: response.status,
          data: response.data
        });
        await User.findByIdAndDelete(testUser._id);
        return false;
      }
      
    } catch (error) {
      this.logTest('Email Verification Endpoint', false, 'Exception occurred', {
        error: error.message
      });
      return false;
    }
  }

  async testResendVerificationEndpoint() {
    console.log('\n🔄 Testing Resend Verification Endpoint...');
    
    try {
      // Create a test user without verification
      const testUser = new User({
        name: 'Test Resend User',
        email: `resend_test_${Date.now()}@example.com`,
        password: 'TestPassword123!',
        role: 'user',
        emailVerified: false
      });
      
      await testUser.save();
      
      // Test resend verification
      const response = await axios.post(`${this.baseUrl}/auth/resend-verification`, {
        email: testUser.email
      });
      
      if (response.status === 200 && response.data.success) {
        this.logTest('Resend Verification Endpoint', true, 'Verification email resent successfully', {
          message: response.data.message
        });
        
        // Check if verification token was generated
        const updatedUser = await User.findById(testUser._id);
        if (updatedUser && updatedUser.emailVerificationToken) {
          this.logTest('Verification Token Generation', true, 'New verification token generated');
        } else {
          this.logTest('Verification Token Generation', false, 'No verification token found');
        }
        
        // Clean up
        await User.findByIdAndDelete(testUser._id);
        return true;
        
      } else {
        this.logTest('Resend Verification Endpoint', false, 'Resend failed', {
          status: response.status,
          data: response.data
        });
        await User.findByIdAndDelete(testUser._id);
        return false;
      }
      
    } catch (error) {
      this.logTest('Resend Verification Endpoint', false, 'Exception occurred', {
        error: error.message
      });
      return false;
    }
  }

  async testEmailVerificationMiddleware() {
    console.log('\n🛡️  Testing Email Verification Middleware...');
    
    try {
      // Create test user without email verification
      const testUser = new User({
        name: 'Test Middleware User',
        email: `middleware_test_${Date.now()}@example.com`,
        password: 'TestPassword123!',
        role: 'user',
        emailVerified: false
      });
      
      await testUser.save();
      
      // Login to get JWT token
      const loginResponse = await axios.post(`${this.baseUrl}/auth/login`, {
        email: testUser.email,
        password: 'TestPassword123!'
      });
      
      if (!loginResponse.data.success) {
        throw new Error('Login failed for middleware test');
      }
      
      const token = loginResponse.data.token;
      
      // Test accessing email verification status endpoint
      const statusResponse = await axios.get(`${this.baseUrl}/auth/email-verification/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (statusResponse.status === 200) {
        this.logTest('Email Verification Status Check', true, 'Status endpoint accessible', {
          isVerified: statusResponse.data.data?.isVerified,
          email: statusResponse.data.data?.email
        });
      } else {
        this.logTest('Email Verification Status Check', false, 'Status check failed');
      }
      
      // Clean up
      await User.findByIdAndDelete(testUser._id);
      return true;
      
    } catch (error) {
      if (error.response?.status === 401) {
        this.logTest('Email Verification Middleware', false, 'Authentication failed', {
          error: error.response.data?.message
        });
      } else {
        this.logTest('Email Verification Middleware', false, 'Exception occurred', {
          error: error.message
        });
      }
      return false;
    }
  }

  async testEmailTemplateRendering() {
    console.log('\n🎨 Testing Email Template Rendering...');
    
    try {
      const testData = {
        name: 'Template Test User',
        email: process.env.EMAIL_FROM
      };
      const testToken = 'test-token-123';
      
      // Test if template renders without errors
      const result = await emailService.sendEmailVerification(testData, testToken);
      
      if (result.success) {
        this.logTest('Email Template Rendering', true, 'Template rendered and sent successfully', {
          messageId: result.messageId
        });
        return true;
      } else {
        this.logTest('Email Template Rendering', false, 'Template rendering failed', {
          error: result.error
        });
        return false;
      }
      
    } catch (error) {
      this.logTest('Email Template Rendering', false, 'Template exception occurred', {
        error: error.message
      });
      return false;
    }
  }

  async testAWSConfiguration() {
    console.log('\n⚙️  Testing AWS Configuration...');
    
    try {
      // Test SES sending statistics
      const stats = await emailService.getSendingStatistics();
      
      this.logTest('AWS SES Statistics', true, 'SES statistics retrieved', {
        maxSend24h: stats.quota?.max24HourSend,
        maxSendRate: stats.quota?.maxSendRate,
        sentLast24h: stats.quota?.sentLast24Hours
      });
      
      return true;
      
    } catch (error) {
      this.logTest('AWS SES Statistics', false, 'Could not retrieve SES statistics', {
        error: error.message
      });
      return false;
    }
  }

  async runAllTests() {
    console.log('🧪 COMPREHENSIVE EMAIL VERIFICATION TESTING');
    console.log('='.repeat(70));
    
    console.log(`📋 Configuration:`);
    console.log(`   Email From: ${process.env.EMAIL_FROM}`);
    console.log(`   AWS Region: ${process.env.AWS_REGION}`);
    console.log(`   Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`   MongoDB URI: ${process.env.MONGODB_URI ? 'SET ✅' : 'NOT SET ❌'}`);
    
    // Connect to database
    const dbConnected = await this.connectToDatabase();
    
    // Run all tests
    const tests = [
      () => this.testDirectEmailSending(),
      () => this.testEmailVerificationFunction(),
      () => this.testEmailTemplateRendering(),
      () => this.testAWSConfiguration()
    ];
    
    // Add database-dependent tests if connected
    if (dbConnected) {
      tests.push(
        () => this.testUserRegistrationFlow(),
        () => this.testEmailVerificationEndpoint(),
        () => this.testResendVerificationEndpoint(),
        () => this.testEmailVerificationMiddleware()
      );
    }
    
    // Run tests sequentially
    for (const test of tests) {
      try {
        await test();
      } catch (error) {
        console.log(`❌ Test failed with exception: ${error.message}`);
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Print summary
    this.printSummary();
    
    // Close database connection
    if (dbConnected) {
      await mongoose.disconnect();
      console.log('🔒 MongoDB connection closed');
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(70));
    
    const total = this.testResults.passed + this.testResults.failed;
    const successRate = total > 0 ? ((this.testResults.passed / total) * 100).toFixed(1) : 0;
    
    console.log(`📈 Overall Results:`);
    console.log(`   Total Tests: ${total}`);
    console.log(`   Passed: ${this.testResults.passed} ✅`);
    console.log(`   Failed: ${this.testResults.failed} ❌`);
    console.log(`   Success Rate: ${successRate}%`);
    
    if (this.testResults.failed > 0) {
      console.log(`\\n❌ Failed Tests:`);
      this.testResults.tests
        .filter(test => !test.success)
        .forEach(test => {
          console.log(`   - ${test.test}: ${test.message}`);
        });
    }
    
    console.log(`\\n📝 Recommendations:`);
    
    if (this.testResults.passed === total) {
      console.log('   🎉 All tests passed! Email verification system is working correctly.');
      console.log('   ✅ Ready for production use.');
    } else if (successRate >= 75) {
      console.log('   🟡 Most tests passed. Review failed tests for minor issues.');
      console.log('   ⚠️  System is functional but needs attention.');
    } else {
      console.log('   🔴 Multiple tests failed. Email system needs significant work.');
      console.log('   ❌ Not ready for production use.');
    }
    
    console.log(`\\n📧 Next Steps:`);
    console.log('   1. Check your email inbox for test messages');
    console.log('   2. Review any failed test details above');
    console.log('   3. Fix configuration issues if any');
    console.log('   4. Run integration tests with frontend');
    console.log('   5. Test with real user registrations');
    
    console.log(`\\n💾 Test Results saved to: test-results-${Date.now()}.json`);
  }

  async saveResults() {
    const fs = require('fs').promises;
    const filename = `test-results-${Date.now()}.json`;
    
    const results = {
      timestamp: new Date().toISOString(),
      configuration: {
        emailFrom: process.env.EMAIL_FROM,
        awsRegion: process.env.AWS_REGION,
        frontendUrl: process.env.FRONTEND_URL
      },
      summary: {
        total: this.testResults.passed + this.testResults.failed,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        successRate: this.testResults.passed / (this.testResults.passed + this.testResults.failed) * 100
      },
      tests: this.testResults.tests
    };
    
    try {
      await fs.writeFile(filename, JSON.stringify(results, null, 2));
      return filename;
    } catch (error) {
      console.log('Could not save test results:', error.message);
      return null;
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new EmailVerificationTester();
  tester.runAllTests()
    .then(() => tester.saveResults())
    .catch(console.error);
}

module.exports = EmailVerificationTester;