import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import geolocationService from '../services/geolocationService';
import { FiMapPin, FiNavigation, FiFilter, FiRefreshCw, FiEye, FiEyeOff, FiTarget } from 'react-icons/fi';

// Fix leaflet default markers issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

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

const MapControls = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
`;

const ControlButton = styled.button`
  background: white;
  border: 2px solid #e0e0e0;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  color: var(--dark-gray);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 120px;
  justify-content: center;
  
  &:hover {
    border-color: var(--primary-coral);
    color: var(--primary-coral);
    transform: translateY(-1px);
  }
  
  &.active {
    background: var(--primary-coral);
    color: white;
    border-color: var(--primary-coral);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
      border-color: #e0e0e0;
      color: var(--dark-gray);
    }
  }
`;

const LocationButton = styled(motion.button)`
  position: absolute;
  bottom: 100px;
  right: 20px;
  background: var(--primary-coral);
  border: none;
  padding: 12px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  color: white;
  font-size: 18px;
  z-index: 1000;
  transition: all 0.3s ease;
  
  &:hover {
    background: #e55a4f;
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
    }
  }
`;

const FilterPanel = styled(motion.div)`
  position: absolute;
  top: 60px;
  right: 10px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 280px;
  
  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    h3 {
      margin: 0;
      color: var(--dark-gray);
      font-size: 16px;
    }
    
    .close-btn {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 4px;
      
      &:hover {
        color: var(--primary-coral);
      }
    }
  }
  
  .filter-group {
    margin-bottom: 16px;
    
    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 600;
      color: var(--dark-gray);
      font-size: 14px;
    }
    
    select, input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      
      &:focus {
        outline: none;
        border-color: var(--primary-coral);
      }
    }
  }
  
  .filter-actions {
    display: flex;
    gap: 8px;
    
    button {
      flex: 1;
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &.primary {
        background: var(--primary-coral);
        color: white;
        
        &:hover {
          background: #e55a4f;
        }
      }
      
      &.secondary {
        background: #f8f9fa;
        color: #666;
        border: 1px solid #e0e0e0;
        
        &:hover {
          background: #e9ecef;
        }
      }
    }
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 12px;
  
  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #e0e0e0;
    border-top: 2px solid var(--primary-coral);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const StatusIndicator = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    
    &.connected {
      background: #28a745;
    }
    
    &.loading {
      background: #ffc107;
      animation: pulse 1.5s ease-in-out infinite;
    }
    
    &.error {
      background: #dc3545;
    }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

// User location icon
const userLocationIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007bff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="#007bff"></circle>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24]
});

// Map event handler component
const MapEventHandler = ({ onBoundsChange, onZoomChange }) => {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      onBoundsChange(bounds);
      onZoomChange(zoom);
    },
    zoomend: () => {
      const zoom = map.getZoom();
      onZoomChange(zoom);
    }
  });
  
  return null;
};

const LiveHeatMap = ({ onAlertClick, filters: externalFilters }) => {
  // State management
  const [mapType, setMapType] = useState('street');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [status, setStatus] = useState('loading');
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // Refs
  const mapRef = useRef(null);
  const refreshIntervalRef = useRef(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    severity: '',
    category: '',
    timeRange: '7d',
    minAlerts: 1,
    ...externalFilters
  });

  // Fetch heatmap data
  const fetchHeatmapData = useCallback(async (mapBounds = bounds, zoom = mapZoom) => {
    setLoading(true);
    setError(null);
    setStatus('loading');
    
    try {
      let url = '/api/alerts/heatmap?';
      const params = new URLSearchParams();
      
      // Add bounds if available
      if (mapBounds) {
        const boundsStr = `${mapBounds.getNorth()},${mapBounds.getSouth()},${mapBounds.getEast()},${mapBounds.getWest()}`;
        params.append('bounds', boundsStr);
      }
      
      params.append('zoom', zoom.toString());
      
      // Add filters
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.category) params.append('category', filters.category);
      if (filters.timeRange !== '7d') params.append('timeRange', filters.timeRange);
      
      const response = await fetch(url + params.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setHeatmapData(data.data || []);
        setStatus('connected');
        console.log(`Loaded ${data.data?.length || 0} alert clusters`);
      } else {
        throw new Error(data.message || 'Failed to fetch heatmap data');
      }
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      setError(error.message);
      setStatus('error');
      toast.error('Failed to load alert data');
    } finally {
      setLoading(false);
    }
  }, [bounds, mapZoom, filters]);

  // Get user location
  const getUserLocation = useCallback(async () => {
    setLoading(true);
    try {
      const permission = await geolocationService.requestPermission();
      setLocationPermission(permission);
      
      if (permission === 'granted') {
        const location = await geolocationService.getUserLocation();
        setUserLocation(location);
        
        if (location.source !== 'default') {
          setMapCenter([location.lat, location.lng]);
          setMapZoom(location.source === 'ip' ? 8 : 12);
          toast.success(`Location detected: ${geolocationService.formatLocation(location)}`);
        }
        
        return location;
      } else if (permission === 'denied') {
        toast.error('Location access denied. Using default location.');
      }
    } catch (error) {
      console.error('Location error:', error);
      toast.error(error.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle map bounds change
  const handleBoundsChange = useCallback((newBounds) => {
    setBounds(newBounds);
    fetchHeatmapData(newBounds, mapZoom);
  }, [mapZoom, fetchHeatmapData]);

  // Handle zoom change
  const handleZoomChange = useCallback((newZoom) => {
    setMapZoom(newZoom);
  }, []);

  // Get marker properties based on cluster data
  const getMarkerColor = useCallback((severity, count) => {
    if (severity === 'critical' || count > 50) return '#dc3545';
    if (severity === 'high' || count > 20) return '#fd7e14';
    if (severity === 'medium' || count > 10) return '#ffc107';
    return '#28a745';
  }, []);

  const getMarkerSize = useCallback((count, riskScore) => {
    const baseSize = 8;
    const maxSize = 25;
    const size = baseSize + (Math.log(count + 1) * 3) + (riskScore * 2);
    return Math.min(size, maxSize);
  }, []);

  const getRiskLevel = useCallback((severity, count) => {
    if (severity === 'critical' || count > 50) return 'Critical Risk';
    if (severity === 'high' || count > 20) return 'High Risk';
    if (severity === 'medium' || count > 10) return 'Medium Risk';
    return 'Low Risk';
  }, []);

  // Refresh data
  const refreshData = useCallback(() => {
    fetchHeatmapData(bounds, mapZoom);
  }, [fetchHeatmapData, bounds, mapZoom]);

  // Apply filters
  const applyFilters = useCallback(() => {
    fetchHeatmapData(bounds, mapZoom);
    setShowFilters(false);
  }, [fetchHeatmapData, bounds, mapZoom]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      severity: '',
      category: '',
      timeRange: '7d',
      minAlerts: 1
    });
  }, []);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(refreshData, 30000); // 30 seconds
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    } else if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, [autoRefresh, refreshData]);

  // Initial data fetch
  useEffect(() => {
    getUserLocation().then(() => {
      // Initial data fetch will happen after bounds are set
    });
  }, [getUserLocation]);

  // Map tile URLs
  const tileUrls = {
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  return (
    <MapWrapper>
      <MapContainer
        ref={mapRef}
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
        preferCanvas={true}
      >
        <MapEventHandler 
          onBoundsChange={handleBoundsChange}
          onZoomChange={handleZoomChange}
        />
        
        <TileLayer
          url={tileUrls[mapType]}
          attribution={mapType === 'satellite' ? 
            '&copy; <a href="https://www.esri.com/">Esri</a>' : 
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }
          maxZoom={18}
        />
        
        {/* User location marker */}
        {userLocation && userLocation.source !== 'default' && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="alert-popup">
                <div className="popup-title">Your Location</div>
                <div className="popup-details">
                  <div className="detail-row">
                    <span className="label">Location:</span>
                    <span className="value">{geolocationService.formatLocation(userLocation)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Accuracy:</span>
                    <span className="value">{userLocation.accuracy ? `±${Math.round(userLocation.accuracy)}m` : 'Unknown'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Source:</span>
                    <span className="value">{userLocation.source === 'ip' ? 'IP Location' : 'GPS'}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Alert clusters */}
        {showHeatmap && heatmapData.map((cluster, index) => {
          if (!cluster.coordinates || !cluster.coordinates.lat || !cluster.coordinates.lng) {
            return null;
          }
          
          return (
            <CircleMarker
              key={`cluster-${index}`}
              center={[cluster.coordinates.lat, cluster.coordinates.lng]}
              radius={getMarkerSize(cluster.count, cluster.riskScore)}
              fillColor={getMarkerColor(cluster.maxSeverity, cluster.count)}
              color="#fff"
              weight={2}
              opacity={0.8}
              fillOpacity={0.7}
              eventHandlers={{
                click: () => {
                  if (onAlertClick) {
                    onAlertClick(cluster);
                  }
                }
              }}
            >
              <Popup maxWidth={350}>
                <div className="alert-popup">
                  <div className="popup-title">
                    Alert Cluster ({cluster.count} alert{cluster.count !== 1 ? 's' : ''})
                  </div>
                  <div className="popup-alerts">
                    <span 
                      className="alert-count" 
                      style={{ backgroundColor: getMarkerColor(cluster.maxSeverity, cluster.count) }}
                    >
                      {cluster.count} alerts
                    </span>
                    <span className="risk-level">
                      {getRiskLevel(cluster.maxSeverity, cluster.count)}
                    </span>
                  </div>
                  <div className="popup-details">
                    <div className="detail-row">
                      <span className="label">Max Severity:</span>
                      <span className="value" style={{ 
                        color: getMarkerColor(cluster.maxSeverity, cluster.count),
                        fontWeight: 'bold',
                        textTransform: 'capitalize'
                      }}>
                        {cluster.maxSeverity}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Risk Score:</span>
                      <span className="value">{cluster.riskScore}/10</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Categories:</span>
                      <span className="value">
                        {cluster.categories?.join(', ') || 'Various'}
                      </span>
                    </div>
                    {cluster.totalAffectedAnimals > 0 && (
                      <div className="detail-row">
                        <span className="label">Affected Animals:</span>
                        <span className="value">{cluster.totalAffectedAnimals.toLocaleString()}</span>
                      </div>
                    )}
                    {cluster.severityCount && (
                      <div className="detail-row">
                        <span className="label">Breakdown:</span>
                        <span className="value" style={{ fontSize: '11px' }}>
                          {Object.entries(cluster.severityCount)
                            .filter(([_, count]) => count > 0)
                            .map(([severity, count]) => `${count} ${severity}`)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  {cluster.alerts && cluster.alerts.length <= 5 && (
                    <div style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>
                        Recent Alerts:
                      </div>
                      {cluster.alerts.slice(0, 3).map((alert, idx) => (
                        <div key={idx} style={{ fontSize: '11px', marginBottom: '3px', color: '#666' }}>
                          • {alert.title?.substring(0, 40)}{alert.title?.length > 40 ? '...' : ''}
                        </div>
                      ))}
                      {cluster.alerts.length > 3 && (
                        <div style={{ fontSize: '11px', color: '#999' }}>
                          ... and {cluster.alerts.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <LoadingOverlay
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="spinner"></div>
            <span>Loading alerts...</span>
          </LoadingOverlay>
        )}
      </AnimatePresence>

      {/* Map controls */}
      <MapControls>
        <ControlButton
          onClick={() => setMapType(mapType === 'street' ? 'satellite' : 'street')}
          className={mapType === 'satellite' ? 'active' : ''}
        >
          {mapType === 'street' ? '🛰️ Satellite' : '🗺️ Street'}
        </ControlButton>
        
        <ControlButton
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={showHeatmap ? 'active' : ''}
        >
          {showHeatmap ? <FiEyeOff /> : <FiEye />}
          {showHeatmap ? 'Hide' : 'Show'} Alerts
        </ControlButton>
        
        <ControlButton
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? 'active' : ''}
        >
          <FiFilter />
          Filters
        </ControlButton>
        
        <ControlButton
          onClick={refreshData}
          disabled={loading}
        >
          <FiRefreshCw className={loading ? 'spinning' : ''} />
          Refresh
        </ControlButton>
      </MapControls>

      {/* Get location button */}
      <LocationButton
        onClick={getUserLocation}
        disabled={loading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Get my location"
      >
        {locationPermission === 'granted' ? <FiTarget /> : <FiNavigation />}
      </LocationButton>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <FilterPanel
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="filter-header">
              <h3>Filter Alerts</h3>
              <button className="close-btn" onClick={() => setShowFilters(false)}>
                ×
              </button>
            </div>
            
            <div className="filter-group">
              <label>Severity Level</label>
              <select 
                value={filters.severity} 
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              >
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Category</label>
              <select 
                value={filters.category} 
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="">All Categories</option>
                <option value="disease">Disease</option>
                <option value="injury">Injury</option>
                <option value="death">Death</option>
                <option value="vaccination">Vaccination</option>
                <option value="general">General</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Time Range</label>
              <select 
                value={filters.timeRange} 
                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Auto-refresh</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  checked={autoRefresh} 
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  id="auto-refresh"
                />
                <label htmlFor="auto-refresh" style={{ margin: 0, cursor: 'pointer' }}>
                  Refresh every 30 seconds
                </label>
              </div>
            </div>
            
            <div className="filter-actions">
              <button className="secondary" onClick={resetFilters}>
                Reset
              </button>
              <button className="primary" onClick={applyFilters}>
                Apply Filters
              </button>
            </div>
          </FilterPanel>
        )}
      </AnimatePresence>

      {/* Status indicator */}
      <StatusIndicator>
        <div className={`status-dot ${status}`}></div>
        <span>
          {status === 'connected' && `${heatmapData.length} clusters`}
          {status === 'loading' && 'Loading...'}
          {status === 'error' && 'Connection error'}
          {autoRefresh && status === 'connected' && ' • Auto-refresh ON'}
        </span>
      </StatusIndicator>

      {/* Legend */}
      <Legend>
        <div className="legend-title">Alert Risk Levels</div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#dc3545' }}></div>
          <span className="legend-text">Critical Risk</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#fd7e14' }}></div>
          <span className="legend-text">High Risk</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ffc107' }}></div>
          <span className="legend-text">Medium Risk</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#28a745' }}></div>
          <span className="legend-text">Low Risk</span>
        </div>
      </Legend>
    </MapWrapper>
  );
};

export default LiveHeatMap;