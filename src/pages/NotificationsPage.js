import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiFilter,
  FiSearch,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiX,
  FiMapPin,
  FiPhone,
  FiCalendar,
  FiUser,
  FiInfo,
  FiShield
} from 'react-icons/fi';

const NotificationsContainer = styled.div`
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
  min-height: calc(100vh - 80px);
`;

const Header = styled.div`
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
    
    .notification-icon {
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
    
    @media (max-width: 768px) {
      width: 100%;
      justify-content: space-between;
    }
  }
`;

const NotificationStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.color || 'var(--primary-coral)'};
  
  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .stat-icon {
    color: ${props => props.color || 'var(--primary-coral)'};
    font-size: 24px;
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--dark-gray);
  }
  
  .stat-label {
    color: #666;
    font-size: 14px;
    font-weight: 600;
  }
  
  .stat-change {
    font-size: 12px;
    color: #666;
    margin-top: 4px;
  }
`;

const FilterControls = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  
  .controls-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .controls-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--dark-gray);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .controls-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 16px;
    align-items: end;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
`;

const SearchBox = styled.div`
  position: relative;
  
  input {
    width: 100%;
    padding: 12px 40px 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    font-size: 16px;
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: var(--primary-coral);
      box-shadow: 0 0 0 3px rgba(255, 127, 80, 0.1);
    }
  }
  
  .search-icon {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  background: white;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary-coral);
    box-shadow: 0 0 0 3px rgba(255, 127, 80, 0.1);
  }
`;

const ActionButton = styled(motion.button)`
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &.primary {
    background: var(--primary-coral);
    color: white;
    
    &:hover {
      background: #FF6A35;
      transform: translateY(-2px);
    }
  }
  
  &.secondary {
    background: #f8f9fa;
    color: var(--dark-gray);
    border: 2px solid #e0e0e0;
    
    &:hover {
      border-color: var(--primary-coral);
      color: var(--primary-coral);
    }
  }
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NotificationCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => {
    if (props.priority === 'high') return '#dc3545';
    if (props.priority === 'medium') return '#ffc107';
    if (props.priority === 'low') return '#28a745';
    return 'var(--primary-coral)';
  }};
  opacity: ${props => props.read ? 0.7 : 1};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => {
      if (props.priority === 'high') return 'linear-gradient(90deg, #dc3545, #c82333)';
      if (props.priority === 'medium') return 'linear-gradient(90deg, #ffc107, #e0a800)';
      if (props.priority === 'low') return 'linear-gradient(90deg, #28a745, #1e7e34)';
      return 'linear-gradient(90deg, var(--primary-coral), #FF6A35)';
    }};
  }
  
  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }
  
  .notification-info {
    flex: 1;
    
    .notification-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--dark-gray);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .notification-meta {
      display: flex;
      gap: 16px;
      color: #666;
      font-size: 14px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
  
  .notification-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  
  .priority-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    color: white;
    background: ${props => {
      if (props.priority === 'high') return '#dc3545';
      if (props.priority === 'medium') return '#ffc107';
      if (props.priority === 'low') return '#28a745';
      return 'var(--primary-coral)';
    }};
  }
  
  .notification-content {
    margin-bottom: 16px;
    
    .notification-description {
      color: #666;
      line-height: 1.6;
      margin-bottom: 12px;
    }
    
    .notification-details {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 16px;
      
      .details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
      }
      
      .detail-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #666;
        
        .detail-icon {
          color: var(--primary-coral);
          font-size: 16px;
        }
        
        strong {
          color: var(--dark-gray);
        }
      }
    }
  }
  
  .notification-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }
`;

const ActionIconButton = styled(motion.button)`
  padding: 8px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &.read {
    background: rgba(40, 167, 69, 0.1);
    color: #28a745;
    
    &:hover {
      background: rgba(40, 167, 69, 0.2);
    }
  }
  
  &.unread {
    background: rgba(255, 127, 80, 0.1);
    color: var(--primary-coral);
    
    &:hover {
      background: rgba(255, 127, 80, 0.2);
    }
  }
  
  &.delete {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
    
    &:hover {
      background: rgba(220, 53, 69, 0.2);
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  .empty-icon {
    font-size: 64px;
    color: #ddd;
    margin-bottom: 20px;
  }
  
  h3 {
    color: var(--dark-gray);
    margin-bottom: 12px;
    font-size: 1.5rem;
  }
  
  p {
    color: #666;
    font-size: 16px;
  }
`;

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock notification data
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'alert',
        priority: 'high',
        title: 'Disease Outbreak Alert - Andhra Pradesh',
        description: 'Multiple cases of African Swine Fever reported in Visakhapatnam district. Immediate preventive measures recommended.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        location: 'Visakhapatnam, Andhra Pradesh',
        reporter: 'Dr. Rajesh Kumar',
        contact: '+91 9876543210',
        affectedAnimals: '15 pigs'
      },
      {
        id: 2,
        type: 'compliance',
        priority: 'medium',
        title: 'Compliance Certification Due',
        description: 'Your farm certification is expiring in 30 days. Please renew your biosecurity compliance assessment.',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        read: false,
        location: 'Chennai, Tamil Nadu',
        reporter: 'System Alert',
        expiryDate: '2024-02-15'
      },
      {
        id: 3,
        type: 'info',
        priority: 'low',
        title: 'New Learning Module Available',
        description: 'A new training module on "Advanced Biosecurity Measures" has been added to the learning center.',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        read: true,
        location: 'All Regions',
        reporter: 'PashuMitra Team'
      },
      {
        id: 4,
        type: 'alert',
        priority: 'high',
        title: 'Water Quality Alert - Karnataka',
        description: 'Contaminated water supply detected affecting multiple farms in Bangalore rural area. Immediate action required.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        read: true,
        location: 'Bangalore Rural, Karnataka',
        reporter: 'Environmental Monitoring Team',
        contact: '+91 9876543211',
        affectedFarms: '8 farms'
      },
      {
        id: 5,
        type: 'weather',
        priority: 'medium',
        title: 'Severe Weather Warning',
        description: 'Heavy rainfall and thunderstorms expected in the next 48 hours. Secure your livestock and equipment.',
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
        read: false,
        location: 'Kerala State',
        reporter: 'Weather Monitoring Service'
      }
    ];
    
    setNotifications(mockNotifications);
    setFilteredNotifications(mockNotifications);
  }, []);

  // Filter notifications
  useEffect(() => {
    let filtered = notifications.filter(notification => {
      const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           notification.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           notification.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || notification.type === filterType;
      const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'read' && notification.read) ||
                           (filterStatus === 'unread' && !notification.read);
      
      return matchesSearch && matchesType && matchesPriority && matchesStatus;
    });
    
    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, filterType, filterPriority, filterStatus]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'alert':
        return <FiAlertTriangle />;
      case 'compliance':
        return <FiShield />;
      case 'info':
        return <FiInfo />;
      case 'weather':
        return <FiAlertTriangle />;
      default:
        return <FiBell />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
  };

  const toggleReadStatus = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: !notification.read }
          : notification
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearAllNotifications = () => {
    if (window.confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      setNotifications([]);
    }
  };

  const getStats = () => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const alerts = notifications.filter(n => n.type === 'alert').length;
    const highPriority = notifications.filter(n => n.priority === 'high').length;
    
    return { total, unread, alerts, highPriority };
  };

  const stats = getStats();

  return (
    <NotificationsContainer>
      <Header>
        <div className="header-left">
          <h1>
            <FiBell className="notification-icon" />
            Notifications
          </h1>
          <p>Stay updated with alerts, compliance reminders, and important updates</p>
        </div>
        <div className="header-right">
          <ActionButton
            className="secondary"
            onClick={markAllAsRead}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiCheckCircle /> Mark All Read
          </ActionButton>
          <ActionButton
            className="primary"
            onClick={clearAllNotifications}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiTrash2 /> Clear All
          </ActionButton>
        </div>
      </Header>

      <NotificationStats>
        <StatCard color="var(--primary-coral)">
          <div className="stat-header">
            <FiBell className="stat-icon" />
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Notifications</div>
        </StatCard>

        <StatCard color="#ffc107">
          <div className="stat-header">
            <FiClock className="stat-icon" />
          </div>
          <div className="stat-value">{stats.unread}</div>
          <div className="stat-label">Unread Notifications</div>
        </StatCard>

        <StatCard color="#dc3545">
          <div className="stat-header">
            <FiAlertTriangle className="stat-icon" />
          </div>
          <div className="stat-value">{stats.alerts}</div>
          <div className="stat-label">Active Alerts</div>
        </StatCard>

        <StatCard color="#28a745">
          <div className="stat-header">
            <FiShield className="stat-icon" />
          </div>
          <div className="stat-value">{stats.highPriority}</div>
          <div className="stat-label">High Priority</div>
        </StatCard>
      </NotificationStats>

      <FilterControls>
        <div className="controls-header">
          <div className="controls-title">
            <FiFilter />
            Filter & Search
          </div>
        </div>
        <div className="controls-grid">
          <SearchBox>
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="search-icon" />
          </SearchBox>
          
          <div>
            <FilterSelect
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="alert">Alerts</option>
              <option value="compliance">Compliance</option>
              <option value="info">Information</option>
              <option value="weather">Weather</option>
            </FilterSelect>
          </div>
          
          <div>
            <FilterSelect
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </FilterSelect>
          </div>
          
          <div>
            <FilterSelect
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </FilterSelect>
          </div>
        </div>
      </FilterControls>

      <NotificationsList>
        <AnimatePresence>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                priority={notification.priority}
                read={notification.read}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                <div className="notification-header">
                  <div className="notification-info">
                    <div className="notification-title">
                      {getNotificationIcon(notification.type)}
                      {notification.title}
                    </div>
                    <div className="notification-meta">
                      <div className="meta-item">
                        <FiClock />
                        {formatTimestamp(notification.timestamp)}
                      </div>
                      <div className="meta-item">
                        <FiMapPin />
                        {notification.location}
                      </div>
                      <div className="meta-item">
                        <FiUser />
                        {notification.reporter}
                      </div>
                    </div>
                  </div>
                  <div className="notification-actions">
                    <div className="priority-badge">{notification.priority}</div>
                    <ActionIconButton
                      className={notification.read ? 'unread' : 'read'}
                      onClick={() => toggleReadStatus(notification.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={notification.read ? 'Mark as unread' : 'Mark as read'}
                    >
                      {notification.read ? <FiEyeOff /> : <FiEye />}
                    </ActionIconButton>
                    <ActionIconButton
                      className="delete"
                      onClick={() => deleteNotification(notification.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Delete notification"
                    >
                      <FiX />
                    </ActionIconButton>
                  </div>
                </div>

                <div className="notification-content">
                  <div className="notification-description">
                    {notification.description}
                  </div>
                  
                  <div className="notification-details">
                    <div className="details-grid">
                      {notification.contact && (
                        <div className="detail-item">
                          <FiPhone className="detail-icon" />
                          <strong>Contact:</strong> {notification.contact}
                        </div>
                      )}
                      {notification.affectedAnimals && (
                        <div className="detail-item">
                          <FiInfo className="detail-icon" />
                          <strong>Affected:</strong> {notification.affectedAnimals}
                        </div>
                      )}
                      {notification.affectedFarms && (
                        <div className="detail-item">
                          <FiInfo className="detail-icon" />
                          <strong>Affected:</strong> {notification.affectedFarms}
                        </div>
                      )}
                      {notification.expiryDate && (
                        <div className="detail-item">
                          <FiCalendar className="detail-icon" />
                          <strong>Expires:</strong> {notification.expiryDate}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="notification-footer">
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    ID: #{notification.id}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {notification.timestamp.toLocaleDateString()}
                  </div>
                </div>
              </NotificationCard>
            ))
          ) : (
            <EmptyState>
              <FiBell className="empty-icon" />
              <h3>No Notifications Found</h3>
              <p>
                {notifications.length === 0
                  ? "You're all caught up! No notifications at the moment."
                  : "No notifications match your current filters. Try adjusting your search criteria."}
              </p>
            </EmptyState>
          )}
        </AnimatePresence>
      </NotificationsList>
    </NotificationsContainer>
  );
};

export default NotificationsPage;