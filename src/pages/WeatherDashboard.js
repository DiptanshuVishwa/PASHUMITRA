import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiCloud,
  FiSun,
  FiCloudRain,
  FiEye,
  FiWind,
  FiDroplet,
  FiThermometer,
  FiAlertTriangle,
  FiCalendar,
  FiMapPin,
  FiRefreshCw,
  FiInfo
} from 'react-icons/fi';

const WeatherContainer = styled.div`
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
  min-height: calc(100vh - 80px);
  
  @media (max-width: 768px) {
    margin: 10px auto;
    padding: 0 16px;
    min-height: calc(100vh - 75px);
  }
  
  @media (max-width: 480px) {
    padding: 0 12px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  
  h1 {
    font-size: 2.5rem;
    color: var(--dark-gray);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    
    @media (max-width: 768px) {
      font-size: 2rem;
      gap: 12px;
    }
    
    @media (max-width: 480px) {
      font-size: 1.8rem;
      gap: 8px;
      flex-direction: column;
    }
  }
  
  .weather-icon {
    color: #4A90E2;
    font-size: 2.5rem;
    
    @media (max-width: 768px) {
      font-size: 2rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1.8rem;
    }
  }
  
  p {
    font-size: 1.2rem;
    color: #666;
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.5;
    
    @media (max-width: 768px) {
      font-size: 1.1rem;
      padding: 0 10px;
    }
    
    @media (max-width: 480px) {
      font-size: 1rem;
      padding: 0 5px;
    }
  }
  
  @media (max-width: 768px) {
    margin-bottom: 30px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 20px;
  }
`;

const WeatherGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const CurrentWeatherCard = styled(motion.div)`
  background: linear-gradient(135deg, #4A90E2, #357ABD);
  color: white;
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 25px;
    border-radius: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 20px;
    border-radius: 12px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: rotate(45deg);
  }
  
  .location {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 20px;
    font-size: 1.1rem;
    opacity: 0.9;
  }
  
  .current-temp {
    font-size: 4rem;
    font-weight: 700;
    margin-bottom: 10px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    
    @media (max-width: 768px) {
      font-size: 3.5rem;
    }
    
    @media (max-width: 480px) {
      font-size: 3rem;
    }
  }
  
  .weather-desc {
    font-size: 1.3rem;
    margin-bottom: 20px;
    opacity: 0.9;
    
    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1.1rem;
    }
  }
  
  .weather-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 15px;
    margin-top: 25px;
  }
  
  .detail-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    
    .detail-icon {
      font-size: 1.5rem;
      opacity: 0.8;
    }
    
    .detail-label {
      font-size: 0.9rem;
      opacity: 0.7;
    }
    
    .detail-value {
      font-size: 1.1rem;
      font-weight: 600;
    }
  }
`;

const AlertsCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 12px;
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    
    .header-icon {
      color: #FF6B35;
      font-size: 24px;
    }
    
    .header-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--dark-gray);
    }
  }
  
  .alert-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 10px;
    border-left: 4px solid transparent;
    
    &.high {
      background: rgba(220, 53, 69, 0.1);
      border-left-color: #dc3545;
    }
    
    &.medium {
      background: rgba(255, 193, 7, 0.1);
      border-left-color: #ffc107;
    }
    
    &.low {
      background: rgba(40, 167, 69, 0.1);
      border-left-color: #28a745;
    }
    
    .alert-icon {
      font-size: 20px;
      color: inherit;
    }
    
    .alert-content {
      flex: 1;
      
      .alert-title {
        font-weight: 600;
        margin-bottom: 2px;
      }
      
      .alert-desc {
        font-size: 12px;
        opacity: 0.7;
      }
    }
    
    .alert-time {
      font-size: 11px;
      opacity: 0.6;
    }
  }
`;

const ForecastSection = styled.div`
  margin-bottom: 30px;
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: between;
    margin-bottom: 25px;
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.4rem;
      font-weight: 600;
      color: var(--dark-gray);
    }
    
    .section-icon {
      color: #4A90E2;
      font-size: 24px;
    }
    
    .refresh-btn {
      background: none;
      border: none;
      color: #4A90E2;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(74, 144, 226, 0.1);
        transform: rotate(180deg);
      }
    }
  }
`;

const ForecastGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
`;

const ForecastCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(74, 144, 226, 0.3);
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 10px;
  }
  
  .forecast-day {
    font-weight: 600;
    margin-bottom: 10px;
    color: var(--dark-gray);
  }
  
  .forecast-icon {
    font-size: 2rem;
    margin-bottom: 10px;
    color: #4A90E2;
  }
  
  .forecast-temps {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    
    .temp-high {
      font-weight: 600;
      color: #FF6B35;
    }
    
    .temp-low {
      color: #666;
    }
  }
  
  .forecast-desc {
    font-size: 12px;
    color: #666;
    margin-bottom: 10px;
  }
  
  .forecast-details {
    display: flex;
    justify-content: space-around;
    font-size: 11px;
    color: #888;
    
    .detail {
      display: flex;
      align-items: center;
      gap: 2px;
    }
  }
`;

const RecommendationsCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 12px;
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    
    .header-icon {
      color: #28a745;
      font-size: 24px;
    }
    
    .header-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--dark-gray);
    }
  }
  
  .recommendation-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 10px;
    background: #f8f9fa;
    
    .rec-icon {
      color: #28a745;
      font-size: 18px;
      margin-top: 2px;
      flex-shrink: 0;
    }
    
    .rec-content {
      flex: 1;
      
      .rec-title {
        font-weight: 600;
        margin-bottom: 4px;
        color: var(--dark-gray);
      }
      
      .rec-desc {
        font-size: 14px;
        color: #666;
        line-height: 1.4;
      }
    }
    
    .rec-priority {
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 10px;
      font-weight: 600;
      
      &.high {
        background: rgba(220, 53, 69, 0.2);
        color: #dc3545;
      }
      
      &.medium {
        background: rgba(255, 193, 7, 0.2);
        color: #ffc107;
      }
      
      &.low {
        background: rgba(40, 167, 69, 0.2);
        color: #28a745;
      }
    }
  }
`;

const WeatherDashboard = () => {
  const [currentWeather] = useState({
    location: 'Srikakulam, Andhra Pradesh',
    temperature: 28,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    visibility: 8,
    pressure: 1013,
    feelsLike: 32
  });

  const [weatherAlerts] = useState([
    {
      id: 1,
      type: 'high',
      title: 'Heavy Rain Warning',
      description: 'Expect heavy rainfall in the next 24 hours',
      time: '2 hours ago',
      icon: FiCloudRain
    },
    {
      id: 2,
      type: 'medium',
      title: 'Wind Advisory',
      description: 'Strong winds expected, secure loose items',
      time: '4 hours ago',
      icon: FiWind
    },
    {
      id: 3,
      type: 'low',
      title: 'Temperature Drop',
      description: 'Slight temperature decrease expected tonight',
      time: '6 hours ago',
      icon: FiThermometer
    }
  ]);

  const [forecast] = useState([
    {
      day: 'Today',
      icon: FiSun,
      high: 30,
      low: 22,
      condition: 'Sunny',
      humidity: 60,
      wind: 8
    },
    {
      day: 'Tomorrow',
      icon: FiCloudRain,
      high: 26,
      low: 19,
      condition: 'Rainy',
      humidity: 80,
      wind: 15
    },
    {
      day: 'Saturday',
      icon: FiCloud,
      high: 28,
      low: 20,
      condition: 'Cloudy',
      humidity: 70,
      wind: 10
    },
    {
      day: 'Sunday',
      icon: FiSun,
      high: 31,
      low: 23,
      condition: 'Clear',
      humidity: 55,
      wind: 6
    },
    {
      day: 'Monday',
      icon: FiCloudRain,
      high: 25,
      low: 18,
      condition: 'Showers',
      humidity: 85,
      wind: 12
    }
  ]);

  const [recommendations] = useState([
    {
      id: 1,
      title: 'Irrigation Management',
      description: 'With heavy rain expected, reduce irrigation for the next 2 days to prevent waterlogging.',
      priority: 'high',
      icon: FiDroplet
    },
    {
      id: 2,
      title: 'Livestock Shelter',
      description: 'Ensure all livestock have adequate shelter before the rain begins tonight.',
      priority: 'high',
      icon: FiAlertTriangle
    },
    {
      id: 3,
      title: 'Harvest Planning',
      description: 'Consider harvesting mature crops before the weather changes.',
      priority: 'medium',
      icon: FiCalendar
    },
    {
      id: 4,
      title: 'Equipment Protection',
      description: 'Secure all farm equipment and machinery in covered areas.',
      priority: 'medium',
      icon: FiInfo
    }
  ]);

  // Utility function for future weather icon mapping
  // const getWeatherIcon = (condition) => {
  //   switch (condition.toLowerCase()) {
  //     case 'sunny':
  //     case 'clear':
  //       return FiSun;
  //     case 'cloudy':
  //     case 'partly cloudy':
  //       return FiCloud;
  //     case 'rainy':
  //     case 'showers':
  //       return FiCloudRain;
  //     case 'snow':
  //       return FiCloudSnow;
  //     default:
  //       return FiSun;
  //   }
  // };

  const refreshWeather = () => {
    // Simulate weather data refresh
    console.log('Refreshing weather data...');
    // In a real app, this would make an API call
  };

  return (
    <WeatherContainer>
      <Header>
        <h1>
          <FiCloud className="weather-icon" />
          Weather Dashboard
        </h1>
        <p>
          Stay informed about weather conditions and get personalized recommendations for your farm operations.
        </p>
      </Header>

      <WeatherGrid>
        <CurrentWeatherCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="location">
            <FiMapPin />
            {currentWeather.location}
          </div>
          
          <div className="current-temp">
            {currentWeather.temperature}°C
          </div>
          
          <div className="weather-desc">
            {currentWeather.condition}
          </div>
          
          <div className="weather-details">
            <div className="detail-item">
              <FiDroplet className="detail-icon" />
              <div className="detail-label">Humidity</div>
              <div className="detail-value">{currentWeather.humidity}%</div>
            </div>
            
            <div className="detail-item">
              <FiWind className="detail-icon" />
              <div className="detail-label">Wind</div>
              <div className="detail-value">{currentWeather.windSpeed} km/h</div>
            </div>
            
            <div className="detail-item">
              <FiEye className="detail-icon" />
              <div className="detail-label">Visibility</div>
              <div className="detail-value">{currentWeather.visibility} km</div>
            </div>
            
            <div className="detail-item">
              <FiThermometer className="detail-icon" />
              <div className="detail-label">Feels Like</div>
              <div className="detail-value">{currentWeather.feelsLike}°C</div>
            </div>
          </div>
        </CurrentWeatherCard>

        <AlertsCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="card-header">
            <FiAlertTriangle className="header-icon" />
            <div className="header-title">Weather Alerts</div>
          </div>
          
          {weatherAlerts.map(alert => (
            <div key={alert.id} className={`alert-item ${alert.type}`}>
              <alert.icon className="alert-icon" />
              <div className="alert-content">
                <div className="alert-title">{alert.title}</div>
                <div className="alert-desc">{alert.description}</div>
              </div>
              <div className="alert-time">{alert.time}</div>
            </div>
          ))}
        </AlertsCard>
      </WeatherGrid>

      <ForecastSection>
        <div className="section-header">
          <div className="section-title">
            <FiCalendar className="section-icon" />
            5-Day Forecast
          </div>
          <button className="refresh-btn" onClick={refreshWeather}>
            <FiRefreshCw />
          </button>
        </div>
        
        <ForecastGrid>
          {forecast.map((day, index) => (
            <ForecastCard
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
            >
              <div className="forecast-day">{day.day}</div>
              <day.icon className="forecast-icon" />
              <div className="forecast-temps">
                <span className="temp-high">{day.high}°</span>
                <span className="temp-low">{day.low}°</span>
              </div>
              <div className="forecast-desc">{day.condition}</div>
              <div className="forecast-details">
                <div className="detail">
                  <FiDroplet />
                  {day.humidity}%
                </div>
                <div className="detail">
                  <FiWind />
                  {day.wind}km/h
                </div>
              </div>
            </ForecastCard>
          ))}
        </ForecastGrid>
      </ForecastSection>

      <RecommendationsCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="card-header">
          <FiInfo className="header-icon" />
          <div className="header-title">Farm Recommendations</div>
        </div>
        
        {recommendations.map(rec => (
          <div key={rec.id} className="recommendation-item">
            <rec.icon className="rec-icon" />
            <div className="rec-content">
              <div className="rec-title">{rec.title}</div>
              <div className="rec-desc">{rec.description}</div>
            </div>
            <span className={`rec-priority ${rec.priority}`}>
              {rec.priority.toUpperCase()}
            </span>
          </div>
        ))}
      </RecommendationsCard>
    </WeatherContainer>
  );
};

export default WeatherDashboard;