import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import LiveHeatMap from '../components/LiveHeatMap';
import { alertAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/translations';
import toast from 'react-hot-toast';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import {
  FiHome,
  FiTrendingUp,
  FiAlertTriangle,
  FiShield,
  FiMapPin,
  FiUsers,
  FiActivity,
  FiBarChart2,
  FiPieChart,
  FiClock,
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }
  
  .header-left {
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
  }
  
  .header-right {
    display: flex;
    gap: 12px;
    align-items: center;
    
    .last-updated {
      color: #666;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
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
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 60px;
    height: 60px;
    background: ${props => props.color || 'var(--primary-coral)'};
    opacity: 0.1;
    border-radius: 50%;
    transform: translate(20px, -20px);
  }
  
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
  
  .stat-trend {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    
    &.up {
      color: #28a745;
    }
    
    &.down {
      color: #dc3545;
    }
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
  
  .stat-sublabel {
    color: #999;
    font-size: 12px;
    margin-top: 4px;
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  
  .chart-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--dark-gray);
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .chart-icon {
    color: var(--primary-coral);
    font-size: 20px;
  }
  
  .chart-period {
    background: #f8f9fa;
    color: #666;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }
`;

const AlertsSection = styled.div`
  margin-bottom: 30px;
`;

const AlertsList = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
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
  
  .view-all {
    color: var(--primary-coral);
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const AlertItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
  background: ${props => {
    if (props.priority === 'high') return 'rgba(220, 53, 69, 0.05)';
    if (props.priority === 'medium') return 'rgba(255, 193, 7, 0.05)';
    return 'rgba(40, 167, 69, 0.05)';
  }};
  border-left: 4px solid ${props => {
    if (props.priority === 'high') return '#dc3545';
    if (props.priority === 'medium') return '#ffc107';
    return '#28a745';
  }};
  
  .alert-icon {
    color: ${props => {
      if (props.priority === 'high') return '#dc3545';
      if (props.priority === 'medium') return '#ffc107';
      return '#28a745';
    }};
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
      margin-bottom: 6px;
    }
    
    .alert-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #999;
    }
  }
  
  .alert-priority {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    color: white;
    background: ${props => {
      if (props.priority === 'high') return '#dc3545';
      if (props.priority === 'medium') return '#ffc107';
      return '#28a745';
    }};
  }
`;

const MapSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  
  .map-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .map-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--dark-gray);
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const MapContainer = styled.div`
  height: 500px;
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  
  .leaflet-container {
    height: 100%;
    width: 100%;
    border-radius: 12px;
  }
  
  .leaflet-popup-content-wrapper {
    border-radius: 8px;
  }
  
  .leaflet-popup-content {
    margin: 12px;
    font-family: inherit;
    line-height: 1.4;
  }
  
  .alert-popup {
    .popup-title {
      font-weight: 600;
      color: var(--dark-gray);
      margin-bottom: 8px;
      font-size: 16px;
    }
    
    .popup-alerts {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    
    .alert-count {
      background: ${props => {
        if (props.alertCount > 20) return '#dc3545';
        if (props.alertCount >= 10) return '#ffc107';
        return '#28a745';
      }};
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
    }
    
    .risk-level {
      font-size: 12px;
      color: #666;
    }
  }
`;



const MapStats = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    font-size: 12px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .stat-label {
      color: #666;
      margin-right: 12px;
    }
    
    .stat-value {
      font-weight: 600;
      color: var(--dark-gray);
    }
  }
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
`;

const ActionCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-coral);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
  
  .action-icon {
    color: var(--primary-coral);
    font-size: 24px;
    margin-bottom: 12px;
  }
  
  .action-title {
    font-weight: 600;
    color: var(--dark-gray);
    margin-bottom: 8px;
  }
  
  .action-description {
    color: #666;
    font-size: 14px;
    line-height: 1.4;
  }
`;

const EnhancedDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { currentLanguage } = useLanguage();
  const [recentAlerts, setRecentAlerts] = useState([]);
  
  // Create translation function using our central utility
  const t = (text) => getTranslation(text, currentLanguage);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertStats, setAlertStats] = useState({
    total: 0,
    active: 0,
    resolved: 0,
    userAlerts: 0
  });
  
  // Fetch recent alerts from API
  useEffect(() => {
    fetchRecentAlerts();
  }, []);
  
  const fetchRecentAlerts = async () => {
    setAlertsLoading(true);
    try {
      // Fetch recent alerts (last 20 alerts, sorted by creation date)
      const response = await alertAPI.getAllAlerts({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      const alerts = response.data || [];
      setRecentAlerts(alerts.slice(0, 4)); // Show only 4 most recent for dashboard
      
      // Calculate stats
      const stats = {
        total: alerts.length,
        active: alerts.filter(alert => alert.status === 'active').length,
        resolved: alerts.filter(alert => alert.status === 'resolved').length,
        userAlerts: user ? alerts.filter(alert => alert.reportedBy && alert.reportedBy._id === user._id).length : 0
      };
      setAlertStats(stats);
      
    } catch (error) {
      console.error('Failed to fetch recent alerts:', error);
      toast.error(t('Failed to load recent alerts'));
    } finally {
      setAlertsLoading(false);
    }
  };
  
  // Mock data for regional alert heatmap
  const regionData = [
    { id: 1, name: 'Andhra Pradesh', alertCount: 28, riskLevel: 'high' },
    { id: 2, name: 'Telangana', alertCount: 15, riskLevel: 'medium' },
    { id: 3, name: 'Karnataka', alertCount: 7, riskLevel: 'low' },
    { id: 4, name: 'Tamil Nadu', alertCount: 22, riskLevel: 'high' },
    { id: 5, name: 'Kerala', alertCount: 12, riskLevel: 'medium' },
    { id: 6, name: 'Maharashtra', alertCount: 31, riskLevel: 'high' },
    { id: 7, name: 'Gujarat', alertCount: 5, riskLevel: 'low' },
    { id: 8, name: 'Rajasthan', alertCount: 18, riskLevel: 'medium' },
    { id: 9, name: 'Punjab', alertCount: 9, riskLevel: 'low' },
    { id: 10, name: 'Haryana', alertCount: 14, riskLevel: 'medium' },
    { id: 11, name: 'Uttar Pradesh', alertCount: 25, riskLevel: 'high' },
    { id: 12, name: 'West Bengal', alertCount: 16, riskLevel: 'medium' }
  ];

  // Mock data for charts
  const complianceData = [
    { month: 'Jan', score: 85, target: 90 },
    { month: 'Feb', score: 78, target: 90 },
    { month: 'Mar', score: 92, target: 90 },
    { month: 'Apr', score: 88, target: 90 },
    { month: 'May', score: 95, target: 90 },
    { month: 'Jun', score: 91, target: 90 }
  ];

  const alertsData = [
    { type: 'Disease', count: 12, color: '#dc3545' },
    { type: 'Compliance', count: 8, color: '#ffc107' },
    { type: 'Weather', count: 15, color: '#17a2b8' },
    { type: 'Equipment', count: 5, color: '#28a745' }
  ];

  const farmHealthData = [
    { day: 'Mon', temperature: 24, humidity: 65, airQuality: 85 },
    { day: 'Tue', temperature: 26, humidity: 68, airQuality: 82 },
    { day: 'Wed', temperature: 25, humidity: 70, airQuality: 88 },
    { day: 'Thu', temperature: 27, humidity: 64, airQuality: 90 },
    { day: 'Fri', temperature: 23, humidity: 72, airQuality: 87 },
    { day: 'Sat', temperature: 25, humidity: 69, airQuality: 85 },
    { day: 'Sun', temperature: 26, humidity: 67, airQuality: 89 }
  ];

  // Helper function to format alert time
  const formatAlertTime = (createdAt) => {
    const now = new Date();
    const alertTime = new Date(createdAt);
    const diffInHours = Math.floor((now - alertTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - alertTime) / (1000 * 60));
      return t('{{count}} minutes ago', { count: diffInMinutes });
    } else if (diffInHours < 24) {
      return t('{{count}} hours ago', { count: diffInHours });
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 
        ? t('1 day ago') 
        : t('{{count}} days ago', { count: diffInDays });
    }
  };
  
  // Helper function to get priority level
  const getAlertPriority = (severity) => {
    switch (severity) {
      case 'critical': return t('High');
      case 'high': return t('High');
      case 'medium': return t('Medium');
      case 'low': return t('Low');
      default: return t('Medium');
    }
  };

  const quickActions = [
    {
      icon: <FiAlertTriangle />,
      title: t('Raise Alert'),
      description: t('Report urgent farm issues'),
      href: '/raise-alert'
    },
    {
      icon: <FiShield />,
      title: t('Compliance Check'),
      description: t('Run biosecurity assessment'),
      href: '/compliance'
    },
    {
      icon: <FiUsers />,
      title: t('Expert Consultation'),
      description: t('Connect with veterinarians'),
      href: '/experts'
    },
    {
      icon: <FiBarChart2 />,
      title: t('Generate Report'),
      description: t('Download farm analytics'),
      href: '/analytics'
    }
  ];

  return (
    <DashboardContainer>
      <DashboardHeader>
        <div className="header-left">
          <h1>
            <FiHome className="dashboard-icon" />
            {t('Farm Dashboard')}
          </h1>
          <p>{t('Monitor your farm\'s health, compliance, and performance in real-time')}</p>
        </div>
        <div className="header-right">
          <div className="last-updated">
            <FiClock />
            {t('Last updated')}: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </DashboardHeader>

      <StatsGrid>
        <StatCard 
          color="var(--primary-coral)"
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="stat-header">
            <FiShield className="stat-icon" />
            <div className="stat-trend up">
              <FiArrowUp />
              +12%
            </div>
          </div>
          <div className="stat-value">92%</div>
          <div className="stat-label">{t('Compliance Score')}</div>
          <div className="stat-sublabel">{t('Above industry average')}</div>
        </StatCard>

        <StatCard 
          color="#dc3545"
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="stat-header">
            <FiAlertTriangle className="stat-icon" />
            <div className="stat-trend down">
              <FiArrowDown />
              -8%
            </div>
          </div>
          <div className="stat-value">{alertsLoading ? '...' : alertStats.active}</div>
          <div className="stat-label">{t('Active Alerts')}</div>
          <div className="stat-sublabel">
            {alertsLoading ? t('Loading...') : 
              isAuthenticated ? t('{{count}} your alerts', { count: alertStats.userAlerts }) : t('{{count}} total alerts', { count: alertStats.total })
            }
          </div>
        </StatCard>

        <StatCard 
          color="#28a745"
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="stat-header">
            <FiHeart className="stat-icon" />
            <div className="stat-trend up">
              <FiArrowUp />
              +5%
            </div>
          </div>
          <div className="stat-value">487</div>
          <div className="stat-label">{t('Healthy Animals')}</div>
          <div className="stat-sublabel">{t('98% health rate')}</div>
        </StatCard>

        <StatCard 
          color="#17a2b8"
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="stat-header">
            <FiThermometer className="stat-icon" />
            <div className="stat-trend up">
              <FiArrowUp />
              +2%
            </div>
          </div>
          <div className="stat-value">25°C</div>
          <div className="stat-label">{t('Avg Temperature')}</div>
          <div className="stat-sublabel">{t('Optimal range')}</div>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="chart-header">
            <div className="chart-title">
              <FiTrendingUp className="chart-icon" />
              {t('Compliance Score Trend')}
            </div>
            <div className="chart-period">{t('Last 6 months')}</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={complianceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="var(--primary-coral)" 
                strokeWidth={3}
                dot={{ fill: 'var(--primary-coral)', strokeWidth: 2, r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#28a745" 
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="chart-header">
            <div className="chart-title">
              <FiPieChart className="chart-icon" />
              {t('Alert Distribution')}
            </div>
            <div className="chart-period">{t('This month')}</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={alertsData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                label={({ type, count }) => `${type}: ${count}`}
              >
                {alertsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>

      <ChartCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ marginBottom: '30px' }}
      >
        <div className="chart-header">
          <div className="chart-title">
            <FiActivity className="chart-icon" />
            {t('Farm Environment Monitoring')}
          </div>
          <div className="chart-period">{t('Last 7 days')}</div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={farmHealthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="temperature" 
              stackId="1" 
              stroke="#dc3545" 
              fill="rgba(220, 53, 69, 0.3)" 
            />
            <Area 
              type="monotone" 
              dataKey="humidity" 
              stackId="2" 
              stroke="#17a2b8" 
              fill="rgba(23, 162, 184, 0.3)" 
            />
            <Area 
              type="monotone" 
              dataKey="airQuality" 
              stackId="3" 
              stroke="#28a745" 
              fill="rgba(40, 167, 69, 0.3)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <MapSection>
        <div className="map-header">
          <div className="map-title">
            <FiMapPin />
            {t('Regional Disease Risk Map')}
          </div>
        </div>
        <MapContainer>
          <MapStats>
            <div className="stat-item">
              <span className="stat-label">{t('Total Regions')}:</span>
              <span className="stat-value">{regionData.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('High Risk')}:</span>
              <span className="stat-value">{regionData.filter(r => r.riskLevel === 'high').length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('Total Alerts')}:</span>
              <span className="stat-value">{regionData.reduce((sum, r) => sum + r.alertCount, 0)}</span>
            </div>
          </MapStats>
          
          <LiveHeatMap regionData={regionData} />
        </MapContainer>
      </MapSection>

      <AlertsSection>
        <AlertsList>
          <div className="alerts-header">
            <div className="alerts-title">
              <FiBell />
              {t('Recent Alerts')}
            </div>
            <a href="/profile?tab=my-alerts" className="view-all">{t('View All')}</a>
          </div>
          
          {alertsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Loading recent alerts...
            </div>
          ) : recentAlerts.length > 0 ? (
            recentAlerts.map((alert, index) => (
              <AlertItem
                key={alert._id}
                priority={getAlertPriority(alert.severity)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <FiAlertTriangle className="alert-icon" />
                <div className="alert-content">
                  <div className="alert-title">{alert.title}</div>
                  <div className="alert-description">
                    {alert.description.length > 80 
                      ? `${alert.description.substring(0, 80)}...` 
                      : alert.description
                    }
                  </div>
                  <div className="alert-meta">
                    <span>
                      <FiMapPin /> 
                      {alert.location?.district || alert.location?.state || t('Location not specified')}
                    </span>
                    <span>
                      <FiClock /> 
                      {formatAlertTime(alert.createdAt)}
                    </span>
                    {alert.reportedBy && alert.reportedBy.name && (
                      <span>{t('By')}: {alert.reportedBy.name}</span>
                    )}
                  </div>
                </div>
                <div className="alert-priority">{getAlertPriority(alert.severity)}</div>
              </AlertItem>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <FiAlertTriangle style={{ fontSize: '48px', marginBottom: '16px', color: '#ccc' }} />
              <div>{t('No recent alerts found')}</div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>
                {t('New alerts will appear here when submitted')}
              </div>
            </div>
          )}
        </AlertsList>
      </AlertsSection>

      <QuickActions>
        {quickActions.map((action, index) => (
          <ActionCard
            key={index}
            as="a"
            href={action.href}
            whileHover={{ y: -3 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="action-icon">{action.icon}</div>
            <div className="action-title">{action.title}</div>
            <div className="action-description">{action.description}</div>
          </ActionCard>
        ))}
      </QuickActions>
    </DashboardContainer>
  );
};

export default EnhancedDashboard;