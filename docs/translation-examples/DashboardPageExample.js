// COMPLETE EXAMPLE: Dashboard Page with Translation Implementation
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiHome, FiPieChart, FiTrendingUp, FiAlertTriangle, 
  FiCalendar, FiMapPin, FiPlus, FiEye 
} from 'react-icons/fi';
import usePageTranslation from '../hooks/usePageTranslation';

const Dashboard = () => {
  // ✅ STEP 1: Use translation hook
  const { t } = usePageTranslation();
  
  // Sample data - in real app this would come from API
  const [dashboardData, setDashboardData] = useState({
    totalAnimals: 150,
    healthyAnimals: 142,
    atRiskAnimals: 8,
    temperature: 28,
    humidity: 65,
    alerts: [
      { id: 1, message: 'High temperature detected in Sector A', time: '2 hours ago', severity: 'warning' },
      { id: 2, message: 'Vaccination due for 12 animals', time: '5 hours ago', severity: 'info' }
    ]
  });

  // ✅ STEP 2: Translate dynamic content
  const getAlertSeverityText = (severity) => {
    switch(severity) {
      case 'warning': return t('Warning');
      case 'danger': return t('Critical');
      case 'info': return t('Information');
      default: return t('Normal');
    }
  };

  const formatRelativeTime = (timeString) => {
    // You can implement more sophisticated time translation here
    // For now, assuming timeString is already in the format "X hours ago"
    if (timeString.includes('hours ago')) {
      const hours = timeString.match(/\\d+/)[0];
      return `${hours} ${t('hours ago')}`;
    }
    return timeString;
  };

  return (
    <DashboardContainer>
      {/* ✅ STEP 3: Translate page header */}
      <DashboardHeader>
        <div>
          <h1>{t('Welcome to PashuMitra')}</h1>
          <p>{t('Monitor and manage your farm with comprehensive insights')}</p>
        </div>
      </DashboardHeader>

      {/* ✅ STEP 4: Translate stats cards */}
      <StatsGrid>
        <StatCard>
          <StatIcon>
            <FiHome />
          </StatIcon>
          <StatContent>
            <StatNumber>{dashboardData.totalAnimals}</StatNumber>
            <StatLabel>{t('Total Animals')}</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon className="success">
            <FiTrendingUp />
          </StatIcon>
          <StatContent>
            <StatNumber>{dashboardData.healthyAnimals}</StatNumber>
            <StatLabel>{t('Healthy')}</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon className="warning">
            <FiAlertTriangle />
          </StatIcon>
          <StatContent>
            <StatNumber>{dashboardData.atRiskAnimals}</StatNumber>
            <StatLabel>{t('At Risk')}</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon className="info">
            <FiMapPin />
          </StatIcon>
          <StatContent>
            <StatNumber>{dashboardData.temperature}°C</StatNumber>
            <StatLabel>{t('Temperature')}</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <DashboardGrid>
        <DashboardSection>
          {/* ✅ STEP 5: Translate section headers */}
          <SectionHeader>
            <h2>{t('Recent Alerts')}</h2>
            <ViewAllButton>
              <FiEye />
              {t('View All')}
            </ViewAllButton>
          </SectionHeader>

          <AlertsList>
            {dashboardData.alerts.length === 0 ? (
              <EmptyState>
                <p>{t('No recent alerts')}</p>
              </EmptyState>
            ) : (
              dashboardData.alerts.map(alert => (
                <AlertItem key={alert.id} severity={alert.severity}>
                  <AlertContent>
                    <AlertMessage>{alert.message}</AlertMessage>
                    <AlertMeta>
                      <span className="severity">{getAlertSeverityText(alert.severity)}</span>
                      <span className="time">{formatRelativeTime(alert.time)}</span>
                    </AlertMeta>
                  </AlertContent>
                  <AlertIcon>
                    <FiAlertTriangle />
                  </AlertIcon>
                </AlertItem>
              ))
            )}
          </AlertsList>
        </DashboardSection>

        <DashboardSection>
          <SectionHeader>
            <h2>{t('Quick Actions')}</h2>
          </SectionHeader>

          <QuickActions>
            <ActionCard>
              <ActionIcon>
                <FiPlus />
              </ActionIcon>
              <ActionContent>
                <h3>{t('Add New Animal')}</h3>
                <p>{t('Register a new animal to your farm')}</p>
              </ActionContent>
            </ActionCard>

            <ActionCard>
              <ActionIcon>
                <FiCalendar />
              </ActionIcon>
              <ActionContent>
                <h3>{t('Schedule Checkup')}</h3>
                <p>{t('Book a veterinary visit')}</p>
              </ActionContent>
            </ActionCard>

            <ActionCard>
              <ActionIcon>
                <FiAlertTriangle />
              </ActionIcon>
              <ActionContent>
                <h3>{t('Raise Alert')}</h3>
                <p>{t('Report an emergency or concern')}</p>
              </ActionContent>
            </ActionCard>

            <ActionCard>
              <ActionIcon>
                <FiPieChart />
              </ActionIcon>
              <ActionContent>
                <h3>{t('View Reports')}</h3>
                <p>{t('Access detailed analytics')}</p>
              </ActionContent>
            </ActionCard>
          </QuickActions>
        </DashboardSection>
      </DashboardGrid>

      {/* ✅ STEP 6: Translate weather widget */}
      <WeatherWidget>
        <WeatherHeader>
          <h3>{t('Weather Update')}</h3>
          <WeatherLocation>
            <FiMapPin />
            {t('Current Location')}
          </WeatherLocation>
        </WeatherHeader>
        <WeatherContent>
          <WeatherTemp>{dashboardData.temperature}°C</WeatherTemp>
          <WeatherDetails>
            <div>
              <span>{t('Humidity')}</span>
              <strong>{dashboardData.humidity}%</strong>
            </div>
            <div>
              <span>{t('Condition')}</span>
              <strong>{t('Partly Cloudy')}</strong>
            </div>
          </WeatherDetails>
        </WeatherContent>
      </WeatherWidget>
    </DashboardContainer>
  );
};

// Styled Components (unchanged)
const DashboardContainer = styled.div\`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
\`;

const DashboardHeader = styled.div\`
  margin-bottom: 30px;
  
  h1 {
    font-size: 2rem;
    color: var(--dark-gray);
    margin-bottom: 8px;
  }
  
  p {
    color: #666;
    margin: 0;
  }
\`;

const StatsGrid = styled.div\`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
\`;

const StatCard = styled(motion.div)\`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
\`;

const StatIcon = styled.div\`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--primary-coral);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  
  &.success {
    background: #4CAF50;
  }
  
  &.warning {
    background: #FF9800;
  }
  
  &.info {
    background: #2196F3;
  }
\`;

const StatContent = styled.div\`
  flex: 1;
\`;

const StatNumber = styled.div\`
  font-size: 2rem;
  font-weight: 700;
  color: var(--dark-gray);
  margin-bottom: 4px;
\`;

const StatLabel = styled.div\`
  color: #666;
  font-size: 14px;
\`;

// ... rest of styled components

export default Dashboard;

/* 
✅ STEP 7: Add these translations to src/utils/translations.js

// Common Dashboard translations for each language:

'Welcome to PashuMitra': 'पशुमित्र में आपका स्वागत है', // Hindi
'Monitor and manage your farm with comprehensive insights': 'व्यापक अंतर्दृष्टि के साथ अपने खेत की निगरानी और प्रबंधन करें',
'Total Animals': 'कुल पशु',
'Healthy': 'स्वस्थ',
'At Risk': 'खतरे में',
'Temperature': 'तापमान',
'Recent Alerts': 'हाल की अलर्ट',
'View All': 'सभी देखें',
'No recent alerts': 'कोई हाल की अलर्ट नहीं',
'Quick Actions': 'त्वरित कार्य',
'Add New Animal': 'नया पशु जोड़ें',
'Register a new animal to your farm': 'अपने खेत में एक नया पशु पंजीकृत करें',
'Schedule Checkup': 'जांच का समय निर्धारित करें',
'Book a veterinary visit': 'पशु चिकित्सा यात्रा बुक करें',
'Raise Alert': 'अलर्ट उठाएं',
'Report an emergency or concern': 'आपातकाल या चिंता की रिपोर्ट करें',
'View Reports': 'रिपोर्ट देखें',
'Access detailed analytics': 'विस्तृत विश्लेषण तक पहुंच',
'Weather Update': 'मौसम अपडेट',
'Current Location': 'वर्तमान स्थान',
'Humidity': 'आर्द्रता',
'Condition': 'स्थिति',
'Partly Cloudy': 'आंशिक रूप से बादल',
'Warning': 'चेतावनी',
'Critical': 'गंभीर',
'Information': 'जानकारी',
'Normal': 'सामान्य',
'hours ago': 'घंटे पहले',

// Repeat for all languages (Bengali, Telugu, Tamil, etc.)
*/