import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';

const MapWrapper = styled.div`
  height: 100%;
  width: 100%;
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
    min-width: 200px;
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
      margin-bottom: 8px;
    }
    
    .alert-count {
      background: var(--primary-coral);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
    }
    
    .risk-level {
      font-size: 12px;
      color: #666;
      text-transform: capitalize;
    }
    
    .popup-details {
      margin-top: 8px;
      font-size: 14px;
      color: #666;
      
      .detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        
        .label {
          font-weight: 500;
        }
        
        .value {
          color: var(--dark-gray);
        }
      }
    }
  }
`;

const Legend = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  
  .legend-title {
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--dark-gray);
    font-size: 14px;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    font-size: 12px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.8);
    }
    
    .legend-text {
      color: #666;
    }
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  border: 2px solid #e0e0e0;
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  color: var(--dark-gray);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-coral);
    color: var(--primary-coral);
  }
  
  &.active {
    background: var(--primary-coral);
    color: white;
    border-color: var(--primary-coral);
  }
`;

// Indian states with coordinates and alert data
const stateData = [
  // North India
  { id: 1, name: 'Delhi', lat: 28.6139, lng: 77.2090, alertCount: 18, population: '32M' },
  { id: 2, name: 'Punjab', lat: 31.1471, lng: 75.3412, alertCount: 9, population: '28M' },
  { id: 3, name: 'Haryana', lat: 29.0588, lng: 76.0856, alertCount: 14, population: '25M' },
  { id: 4, name: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734, alertCount: 4, population: '7M' },
  { id: 5, name: 'Uttarakhand', lat: 30.0668, lng: 79.0193, alertCount: 6, population: '10M' },
  { id: 6, name: 'Jammu & Kashmir', lat: 34.0837, lng: 74.7973, alertCount: 8, population: '12M' },
  
  // Central India  
  { id: 7, name: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, alertCount: 35, population: '200M' },
  { id: 8, name: 'Madhya Pradesh', lat: 22.9734, lng: 78.6569, alertCount: 22, population: '73M' },
  { id: 9, name: 'Rajasthan', lat: 27.0238, lng: 74.2179, alertCount: 16, population: '69M' },
  { id: 10, name: 'Gujarat', lat: 22.2587, lng: 71.1924, alertCount: 12, population: '60M' },
  { id: 11, name: 'Maharashtra', lat: 19.7515, lng: 75.7139, alertCount: 31, population: '112M' },
  { id: 12, name: 'Goa', lat: 15.2993, lng: 74.1240, alertCount: 2, population: '1.5M' },
  
  // East India
  { id: 13, name: 'West Bengal', lat: 22.9868, lng: 87.8550, alertCount: 19, population: '91M' },
  { id: 14, name: 'Bihar', lat: 25.0961, lng: 85.3131, alertCount: 28, population: '104M' },
  { id: 15, name: 'Jharkhand', lat: 23.6102, lng: 85.2799, alertCount: 15, population: '33M' },
  { id: 16, name: 'Odisha', lat: 20.9517, lng: 85.0985, alertCount: 13, population: '42M' },
  { id: 17, name: 'Assam', lat: 26.2006, lng: 92.9376, alertCount: 11, population: '31M' },
  { id: 18, name: 'Tripura', lat: 23.9408, lng: 91.9882, alertCount: 5, population: '4M' },
  { id: 19, name: 'Manipur', lat: 24.6637, lng: 93.9063, alertCount: 3, population: '3M' },
  { id: 20, name: 'Mizoram', lat: 23.1645, lng: 92.9376, alertCount: 2, population: '1M' },
  { id: 21, name: 'Nagaland', lat: 26.1584, lng: 94.5624, alertCount: 4, population: '2M' },
  { id: 22, name: 'Meghalaya', lat: 25.4670, lng: 91.3662, alertCount: 3, population: '3M' },
  { id: 23, name: 'Arunachal Pradesh', lat: 28.2180, lng: 94.7278, alertCount: 2, population: '1.4M' },
  { id: 24, name: 'Sikkim', lat: 27.5330, lng: 88.5122, alertCount: 1, population: '0.6M' },
  
  // South India
  { id: 25, name: 'Andhra Pradesh', lat: 15.9129, lng: 79.7400, alertCount: 26, population: '49M' },
  { id: 26, name: 'Telangana', lat: 18.1124, lng: 79.0193, alertCount: 20, population: '35M' },
  { id: 27, name: 'Karnataka', lat: 15.3173, lng: 75.7139, alertCount: 17, population: '61M' },
  { id: 28, name: 'Tamil Nadu', lat: 11.1271, lng: 78.6569, alertCount: 24, population: '72M' },
  { id: 29, name: 'Kerala', lat: 10.8505, lng: 76.2711, alertCount: 14, population: '33M' },
  { id: 30, name: 'Puducherry', lat: 11.9416, lng: 79.8083, alertCount: 3, population: '1.2M' }
];

// Component to handle map view updates
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

const LiveHeatMap = ({ regionData }) => {
  const [mapType, setMapType] = useState('satellite'); // 'street' or 'satellite'
  const [showHeatmap] = useState(true);
  
  // Default center for India
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 5;

  // Function to get color based on alert count
  const getMarkerColor = (alertCount) => {
    if (alertCount > 20) return '#dc3545'; // Red for high risk
    if (alertCount >= 10) return '#ffc107'; // Yellow for medium risk
    return '#28a745'; // Green for low risk
  };

  // Function to get marker size based on alert count
  const getMarkerSize = (alertCount) => {
    if (alertCount > 25) return 12;
    if (alertCount > 15) return 10;
    if (alertCount > 5) return 8;
    return 6;
  };

  // Function to get risk level text
  const getRiskLevel = (alertCount) => {
    if (alertCount > 20) return 'High Risk';
    if (alertCount >= 10) return 'Medium Risk';
    return 'Low Risk';
  };

  // Map tile URLs
  const tileUrls = {
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  return (
    <MapWrapper>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <MapController center={defaultCenter} zoom={defaultZoom} />
        
        <TileLayer
          url={tileUrls[mapType]}
          attribution={mapType === 'satellite' ? 
            '&copy; <a href="https://www.esri.com/">Esri</a>' : 
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }
        />
        
        {showHeatmap && stateData.map((state) => (
          <CircleMarker
            key={state.id}
            center={[state.lat, state.lng]}
            radius={getMarkerSize(state.alertCount)}
            fillColor={getMarkerColor(state.alertCount)}
            color="#fff"
            weight={2}
            opacity={0.8}
            fillOpacity={0.7}
          >
            <Popup>
              <div className="alert-popup">
                <div className="popup-title">{state.name}</div>
                <div className="popup-alerts">
                  <span className="alert-count" style={{ backgroundColor: getMarkerColor(state.alertCount) }}>
                    {state.alertCount} alerts
                  </span>
                  <span className="risk-level">{getRiskLevel(state.alertCount)}</span>
                </div>
                <div className="popup-details">
                  <div className="detail-row">
                    <span className="label">Population:</span>
                    <span className="value">{state.population}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Risk Level:</span>
                    <span className="value" style={{ color: getMarkerColor(state.alertCount) }}>
                      {getRiskLevel(state.alertCount)}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <ToggleButton
        onClick={() => setMapType(mapType === 'street' ? 'satellite' : 'street')}
      >
        {mapType === 'street' ? '🛰️ Satellite' : '🗺️ Street'}
      </ToggleButton>

      <Legend>
        <div className="legend-title">Alert Density</div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#dc3545' }}></div>
          <span className="legend-text">High Risk (>20 alerts)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ffc107' }}></div>
          <span className="legend-text">Medium Risk (10-20 alerts)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#28a745' }}></div>
          <span className="legend-text">Low Risk (&lt;10 alerts)</span>
        </div>
      </Legend>
    </MapWrapper>
  );
};

export default LiveHeatMap;