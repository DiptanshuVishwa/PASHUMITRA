import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiDollarSign,
  FiActivity,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiFilter,
  FiEye,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiTarget
} from 'react-icons/fi';

const AnalyticsContainer = styled.div`
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
  min-height: calc(100vh - 80px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  
  .header-left {
    h1 {
      font-size: 2.5rem;
      color: var(--dark-gray);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .analytics-icon {
      color: #6366F1;
      font-size: 2.5rem;
    }
    
    p {
      color: #666;
      font-size: 1.1rem;
    }
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
    
    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &.primary {
        background: #6366F1;
        color: white;
        
        &:hover {
          background: #5B5CF1;
          transform: translateY(-2px);
        }
      }
      
      &.secondary {
        background: white;
        color: #666;
        border: 2px solid #e0e0e0;
        
        &:hover {
          border-color: #6366F1;
          color: #6366F1;
        }
      }
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
`;

const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const KPICard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.color || '#6366F1'};
  
  .kpi-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    
    .kpi-icon {
      padding: 10px;
      border-radius: 10px;
      background: ${props => props.color}20;
      color: ${props => props.color || '#6366F1'};
      font-size: 24px;
    }
    
    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      
      &.positive {
        color: #10B981;
      }
      
      &.negative {
        color: #EF4444;
      }
    }
  }
  
  .kpi-value {
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--dark-gray);
    margin-bottom: 5px;
  }
  
  .kpi-label {
    color: #666;
    font-size: 14px;
    font-weight: 500;
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const ChartCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .chart-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--dark-gray);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .chart-actions {
      display: flex;
      gap: 8px;
      
      .chart-btn {
        padding: 6px;
        border: none;
        background: #f8f9fa;
        border-radius: 6px;
        cursor: pointer;
        color: #666;
        transition: all 0.3s ease;
        
        &:hover {
          background: #6366F1;
          color: white;
        }
      }
    }
  }
  
  .chart-placeholder {
    height: 300px;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 14px;
    border: 2px dashed #dee2e6;
  }
`;

const TableCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .table-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--dark-gray);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .table-filters {
      display: flex;
      gap: 10px;
      
      select {
        padding: 8px 12px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        background: white;
        
        &:focus {
          outline: none;
          border-color: #6366F1;
        }
      }
    }
  }
  
  .table-container {
    overflow-x: auto;
    
    table {
      width: 100%;
      border-collapse: collapse;
      
      th {
        text-align: left;
        padding: 12px;
        background: #f8f9fa;
        font-weight: 600;
        color: var(--dark-gray);
        font-size: 13px;
        border-bottom: 2px solid #e9ecef;
      }
      
      td {
        padding: 12px;
        border-bottom: 1px solid #e9ecef;
        font-size: 14px;
      }
      
      tr:hover {
        background: rgba(99, 102, 241, 0.05);
      }
    }
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  
  &.healthy {
    background: rgba(16, 185, 129, 0.1);
    color: #10B981;
  }
  
  &.warning {
    background: rgba(245, 158, 11, 0.1);
    color: #F59E0B;
  }
  
  &.critical {
    background: rgba(239, 68, 68, 0.1);
    color: #EF4444;
  }
  
  &.completed {
    background: rgba(34, 197, 94, 0.1);
    color: #22C55E;
  }
  
  &.pending {
    background: rgba(156, 163, 175, 0.1);
    color: #9CA3AF;
  }
`;

const AnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const kpiData = [
    {
      id: 1,
      label: 'Total Revenue',
      value: '₹2,45,670',
      trend: '+12.5%',
      positive: true,
      icon: FiDollarSign,
      color: '#10B981'
    },
    {
      id: 2,
      label: 'Active Livestock',
      value: '1,247',
      trend: '+3.2%',
      positive: true,
      icon: FiUsers,
      color: '#6366F1'
    },
    {
      id: 3,
      label: 'Feed Efficiency',
      value: '87.3%',
      trend: '+5.1%',
      positive: true,
      icon: FiActivity,
      color: '#F59E0B'
    },
    {
      id: 4,
      label: 'Health Issues',
      value: '23',
      trend: '-18.2%',
      positive: true,
      icon: FiAlertCircle,
      color: '#EF4444'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      activity: 'Vaccination Schedule',
      farm: 'Barn A',
      status: 'completed',
      date: '2024-01-20',
      animals: 45
    },
    {
      id: 2,
      activity: 'Health Checkup',
      farm: 'Barn B',
      status: 'pending',
      date: '2024-01-22',
      animals: 32
    },
    {
      id: 3,
      activity: 'Feed Distribution',
      farm: 'Barn C',
      status: 'healthy',
      date: '2024-01-21',
      animals: 67
    },
    {
      id: 4,
      activity: 'Disease Treatment',
      farm: 'Barn A',
      status: 'critical',
      date: '2024-01-19',
      animals: 5
    },
    {
      id: 5,
      activity: 'Breeding Program',
      farm: 'Barn D',
      status: 'warning',
      date: '2024-01-18',
      animals: 12
    }
  ];

  const performanceMetrics = [
    {
      month: 'Jan',
      revenue: 245670,
      expenses: 180420,
      livestock: 1247,
      production: 892
    },
    {
      month: 'Feb',
      revenue: 267890,
      expenses: 195630,
      livestock: 1289,
      production: 934
    },
    {
      month: 'Mar',
      revenue: 298450,
      expenses: 210840,
      livestock: 1312,
      production: 987
    }
  ];

  const refreshData = () => {
    console.log('Refreshing analytics data...');
  };

  const exportData = () => {
    console.log('Exporting data...');
  };

  return (
    <AnalyticsContainer>
      <Header>
        <div className="header-left">
          <h1>
            <FiBarChart2 className="analytics-icon" />
            Analytics Dashboard
          </h1>
          <p>Comprehensive insights and performance metrics for your farm operations</p>
        </div>
        
        <div className="header-actions">
          <button className="action-btn secondary" onClick={refreshData}>
            <FiRefreshCw />
            Refresh
          </button>
          <button className="action-btn primary" onClick={exportData}>
            <FiDownload />
            Export Report
          </button>
        </div>
      </Header>

      <KPIGrid>
        {kpiData.map((kpi, index) => (
          <KPICard
            key={kpi.id}
            color={kpi.color}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="kpi-header">
              <div className="kpi-icon">
                <kpi.icon />
              </div>
              <div className={`kpi-trend ${kpi.positive ? 'positive' : 'negative'}`}>
                {kpi.positive ? <FiTrendingUp /> : <FiTrendingDown />}
                {kpi.trend}
              </div>
            </div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-label">{kpi.label}</div>
          </KPICard>
        ))}
      </KPIGrid>

      <ChartsGrid>
        <ChartCard
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="chart-header">
            <div className="chart-title">
              <FiTrendingUp />
              Revenue & Expenses Trend
            </div>
            <div className="chart-actions">
              <button className="chart-btn">
                <FiFilter />
              </button>
              <button className="chart-btn">
                <FiDownload />
              </button>
            </div>
          </div>
          <div className="chart-placeholder">
            📊 Revenue & Expenses Chart<br/>
            <small>Chart visualization would be implemented here using a charting library like Chart.js or Recharts</small>
          </div>
        </ChartCard>

        <ChartCard
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="chart-header">
            <div className="chart-title">
              <FiPieChart />
              Livestock Distribution
            </div>
            <div className="chart-actions">
              <button className="chart-btn">
                <FiEye />
              </button>
            </div>
          </div>
          <div className="chart-placeholder">
            🥧 Livestock Distribution Chart<br/>
            <small>Pie chart showing distribution of different livestock types</small>
          </div>
        </ChartCard>
      </ChartsGrid>

      <TableCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="table-header">
          <div className="table-title">
            <FiActivity />
            Recent Farm Activities
          </div>
          <div className="table-filters">
            <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </div>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Activity</th>
                <th>Farm Location</th>
                <th>Status</th>
                <th>Date</th>
                <th>Animals Affected</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map(activity => (
                <tr key={activity.id}>
                  <td>{activity.activity}</td>
                  <td>{activity.farm}</td>
                  <td>
                    <StatusBadge className={activity.status}>
                      {activity.status}
                    </StatusBadge>
                  </td>
                  <td>{activity.date}</td>
                  <td>{activity.animals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableCard>
    </AnalyticsContainer>
  );
};

export default AnalyticsDashboard;