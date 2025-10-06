import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/translations';
import {
  FiHome,
  FiTrendingUp,
  FiAlertTriangle,
  FiShield,
  FiUsers,
  FiActivity,
  FiBarChart2,
  FiBell,
  FiArrowUp,
  FiArrowDown,
  FiHeart,
  FiThermometer
} from 'react-icons/fi';

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
  min-height: calc(100vh - 80px);
`;

const DashboardHeader = styled.div`
  margin-bottom: 30px;
  
  h1 {
    font-size: 2.5rem;
    color: var(--dark-gray);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .dashboard-icon {
    color: var(--primary-coral);
    font-size: 2.5rem;
  }
  
  p {
    color: #666;
    font-size: 1.1rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.color || 'var(--primary-coral)'};
  
  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }
  
  .stat-icon {
    color: ${props => props.color || 'var(--primary-coral)'};
    font-size: 24px;
  }
  
  .stat-value {
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--dark-gray);
    margin-bottom: 8px;
  }
  
  .stat-label {
    color: #666;
    font-size: 14px;
    font-weight: 600;
  }
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const ActionCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  
  .action-icon {
    color: var(--primary-coral);
    font-size: 32px;
    margin-bottom: 16px;
  }
  
  .action-title {
    font-weight: 600;
    color: var(--dark-gray);
    margin-bottom: 8px;
  }
  
  .action-description {
    color: #666;
    font-size: 14px;
  }
`;

const AlertsSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  
  .alerts-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .alerts-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--dark-gray);
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const AlertItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
  background: rgba(255, 127, 80, 0.05);
  border-left: 4px solid var(--primary-coral);
  
  .alert-icon {
    color: var(--primary-coral);
    font-size: 20px;
  }
  
  .alert-content {
    flex: 1;
    
    .alert-title {
      font-weight: 600;
      color: var(--dark-gray);
      margin-bottom: 4px;
    }
    
    .alert-description {
      color: #666;
      font-size: 14px;
    }
  }
`;

const Dashboard = () => {
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  
  // Create translation function using our central utility
  const t = (text) => getTranslation(text, currentLanguage);
  
  // Sample data
  const [dashboardData] = useState({
    totalAnimals: 147,
    healthyAnimals: 134,
    atRiskAnimals: 13,
    recentAlerts: 3
  });

  return (
    <DashboardContainer>
      <DashboardHeader>
        <h1>
          <FiHome className="dashboard-icon" />
          {t('Welcome to PashuMitra')}
        </h1>
        <p>{user?.name ? `${t('Hello')}, ${user.name}!` : t('Welcome to your farm dashboard')}</p>
      </DashboardHeader>

      {/* Farm Statistics */}
      <StatsGrid>
        <StatCard
          color="var(--primary-coral)"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="stat-header">
            <div className="stat-icon">
              <FiUsers />
            </div>
          </div>
          <div className="stat-value">{dashboardData.totalAnimals}</div>
          <div className="stat-label">{t('Total Animals')}</div>
        </StatCard>

        <StatCard
          color="#28a745"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="stat-header">
            <div className="stat-icon">
              <FiHeart />
            </div>
          </div>
          <div className="stat-value">{dashboardData.healthyAnimals}</div>
          <div className="stat-label">{t('Healthy')}</div>
        </StatCard>

        <StatCard
          color="#ffc107"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="stat-header">
            <div className="stat-icon">
              <FiAlertTriangle />
            </div>
          </div>
          <div className="stat-value">{dashboardData.atRiskAnimals}</div>
          <div className="stat-label">{t('At Risk')}</div>
        </StatCard>

        <StatCard
          color="#17a2b8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="stat-header">
            <div className="stat-icon">
              <FiBell />
            </div>
          </div>
          <div className="stat-value">{dashboardData.recentAlerts}</div>
          <div className="stat-label">{t('Recent Alerts')}</div>
        </StatCard>
      </StatsGrid>

      {/* Quick Actions */}
      <ActionsGrid>
        <ActionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="action-icon">
            <FiUsers />
          </div>
          <div className="action-title">{t('Add New Animal')}</div>
          <div className="action-description">{t('Register a new animal in your farm')}</div>
        </ActionCard>

        <ActionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="action-icon">
            <FiActivity />
          </div>
          <div className="action-title">{t('Schedule Checkup')}</div>
          <div className="action-description">{t('Book a health checkup for your animals')}</div>
        </ActionCard>

        <ActionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="action-icon">
            <FiShield />
          </div>
          <div className="action-title">{t('Contact Vet')}</div>
          <div className="action-description">{t('Get in touch with veterinarians')}</div>
        </ActionCard>

        <ActionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="action-icon">
            <FiBarChart2 />
          </div>
          <div className="action-title">{t('View Reports')}</div>
          <div className="action-description">{t('Check detailed health and activity reports')}</div>
        </ActionCard>
      </ActionsGrid>

      {/* Recent Alerts */}
      <AlertsSection>
        <div className="alerts-header">
          <h3 className="alerts-title">
            <FiBell />
            {t('Recent Alerts')}
          </h3>
        </div>
        
        <AlertItem>
          <div className="alert-icon">
            <FiAlertTriangle />
          </div>
          <div className="alert-content">
            <div className="alert-title">{t('Weather Alert')}</div>
            <div className="alert-description">{t('Heavy rainfall expected in your area. Take necessary precautions for livestock.')}</div>
          </div>
        </AlertItem>

        <AlertItem>
          <div className="alert-icon">
            <FiThermometer />
          </div>
          <div className="alert-content">
            <div className="alert-title">{t('Temperature Warning')}</div>
            <div className="alert-description">{t('High temperatures forecasted. Ensure adequate water supply for animals.')}</div>
          </div>
        </AlertItem>

        <AlertItem>
          <div className="alert-icon">
            <FiShield />
          </div>
          <div className="alert-content">
            <div className="alert-title">{t('Vaccination Reminder')}</div>
            <div className="alert-description">{t('Some animals are due for their routine vaccinations.')}</div>
          </div>
        </AlertItem>
      </AlertsSection>
    </DashboardContainer>
  );
};

export default Dashboard;