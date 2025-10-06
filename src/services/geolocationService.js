/**
 * Geolocation Service
 * Handles user location detection, permission management, and location-based utilities
 */

class GeolocationService {
  constructor() {
    this.currentPosition = null;
    this.watchId = null;
    this.options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };
  }

  /**
   * Check if geolocation is supported by the browser
   * @returns {boolean}
   */
  isSupported() {
    return 'geolocation' in navigator;
  }

  /**
   * Get current position using Promise-based approach
   * @param {Object} options - Geolocation options
   * @returns {Promise<GeolocationPosition>}
   */
  getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const combinedOptions = { ...this.options, ...options };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentPosition = position;
          resolve(position);
        },
        (error) => {
          reject(this.handleLocationError(error));
        },
        combinedOptions
      );
    });
  }

  /**
   * Watch position changes
   * @param {Function} onSuccess - Success callback
   * @param {Function} onError - Error callback
   * @param {Object} options - Geolocation options
   * @returns {number} Watch ID
   */
  watchPosition(onSuccess, onError, options = {}) {
    if (!this.isSupported()) {
      onError(new Error('Geolocation is not supported by this browser'));
      return null;
    }

    const combinedOptions = { ...this.options, ...options };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentPosition = position;
        onSuccess(position);
      },
      (error) => onError(this.handleLocationError(error)),
      combinedOptions
    );

    return this.watchId;
  }

  /**
   * Clear location watch
   */
  clearWatch() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Handle geolocation errors with user-friendly messages
   * @param {GeolocationPositionError} error
   * @returns {Error}
   */
  handleLocationError(error) {
    let message = 'An unknown error occurred while retrieving location';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Location access denied by user. Please enable location access in your browser settings.';
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'Location information is unavailable. Please check your internet connection.';
        break;
      case error.TIMEOUT:
        message = 'Location request timed out. Please try again.';
        break;
    }

    return new Error(message);
  }

  /**
   * Request location permission
   * @returns {Promise<string>} Permission state
   */
  async requestPermission() {
    try {
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        return result.state;
      }
      
      // Fallback: try to get location to trigger permission
      await this.getCurrentPosition();
      return 'granted';
    } catch (error) {
      if (error.message.includes('denied')) {
        return 'denied';
      }
      return 'prompt';
    }
  }

  /**
   * Get user's current location with fallback options
   * @returns {Promise<{lat: number, lng: number}>}
   */
  async getUserLocation() {
    try {
      const position = await this.getCurrentPosition();
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };
    } catch (error) {
      // Fallback to IP-based geolocation or default location
      console.warn('GPS location failed, trying IP-based location:', error.message);
      return await this.getIPLocation();
    }
  }

  /**
   * Get approximate location based on IP address
   * @returns {Promise<{lat: number, lng: number}>}
   */
  async getIPLocation() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        return {
          lat: data.latitude,
          lng: data.longitude,
          city: data.city,
          region: data.region,
          country: data.country_name,
          accuracy: 10000, // IP location is less accurate
          source: 'ip'
        };
      }
      
      throw new Error('IP location not available');
    } catch (error) {
      console.warn('IP location failed, using default location:', error.message);
      
      // Default to India center if all location methods fail
      return {
        lat: 20.5937,
        lng: 78.9629,
        city: 'India',
        region: 'Unknown',
        country: 'India',
        accuracy: 1000000,
        source: 'default'
      };
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {number} lat1 - First latitude
   * @param {number} lng1 - First longitude  
   * @param {number} lat2 - Second latitude
   * @param {number} lng2 - Second longitude
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees
   * @returns {number} Radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get nearby alerts within a radius
   * @param {number} lat - Center latitude
   * @param {number} lng - Center longitude
   * @param {number} radius - Search radius in kilometers
   * @returns {Promise<Array>} Array of nearby alerts
   */
  async getNearbyAlerts(lat, lng, radius = 50) {
    try {
      const radiusInMeters = radius * 1000;
      const response = await fetch(
        `/api/alerts/nearby?lat=${lat}&lng=${lng}&radius=${radiusInMeters}&limit=100`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch nearby alerts');
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching nearby alerts:', error);
      return [];
    }
  }

  /**
   * Create location bounds for map viewport
   * @param {number} lat - Center latitude
   * @param {number} lng - Center longitude
   * @param {number} radiusKm - Radius in kilometers
   * @returns {Object} Bounds object with north, south, east, west
   */
  createBounds(lat, lng, radiusKm) {
    const latDelta = radiusKm / 111; // Approximate km per degree of latitude
    const lngDelta = radiusKm / (111 * Math.cos(this.toRadians(lat)));
    
    return {
      north: lat + latDelta,
      south: lat - latDelta,
      east: lng + lngDelta,
      west: lng - lngDelta,
      center: { lat, lng },
      radius: radiusKm
    };
  }

  /**
   * Format location for display
   * @param {Object} location - Location object
   * @returns {string} Formatted location string
   */
  formatLocation(location) {
    const parts = [
      location.city,
      location.region,
      location.country
    ].filter(Boolean);
    
    return parts.join(', ');
  }

  /**
   * Check if location permission is granted
   * @returns {Promise<boolean>}
   */
  async hasLocationPermission() {
    try {
      const permissionStatus = await this.requestPermission();
      return permissionStatus === 'granted';
    } catch (error) {
      return false;
    }
  }
}

// Create and export singleton instance
export const geolocationService = new GeolocationService();

// Export class for testing
export { GeolocationService };

// Export default
export default geolocationService;