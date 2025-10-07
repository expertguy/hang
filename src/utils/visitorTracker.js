// visitorTracker.js - Utility to track visitors on the frontend without React hooks

import { v4 as uuidv4 } from 'uuid'; // You'll need to install this dependency
import axios from 'axios'; // Using axios directly instead of ApiFunction which uses hooks
import { baseURL } from './api/axiosInstance';

class VisitorTracker {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.shopId = null;
    this.heartbeatInterval = null;
    this.pageLoadTime = Date.now();
    this.currentPage = window.location.pathname;
    this.trackingEnabled = true;
    
    // Base URL for all endpoints
    this.baseUrl = baseURL;
    
    // API endpoints
    this.endpoints = {
      track: `${this.baseUrl}visitor/track`,
      heartbeat: `${this.baseUrl}visitor/heartbeat`,
      pageView: `${this.baseUrl}visitor/page-view`,
      cartAbandonment: `${this.baseUrl}visitor/cart-abandonment`,
      checkoutAbandonment: `${this.baseUrl}visitor/checkout-abandonment`,
      checkoutCompleted: `${this.baseUrl}visitor/checkout-completed`, // New endpoint
      end: `${this.baseUrl}visitor/end`,
      stats: `${this.baseUrl}visitor/stats/`
    };
    
    // Track checkout state in localStorage
    this.checkoutStates = {
      STARTED: 'checkout_started',
      COMPLETED: 'checkout_completed'
    };
  }

  // Get existing session ID or create a new one
  getOrCreateSessionId() {
    let sessionId = localStorage.getItem('visitorSessionId');
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem('visitorSessionId', sessionId);
    }
    return sessionId;
  }

  // Initialize tracking for a specific shop
  async init(shopId) {
    if (!shopId) {
      console.error('Shop ID is required for visitor tracking');
      return;
    }

    this.shopId = shopId;
    
    // Track initial visit
    await this.trackVisit();
    
    // Start heartbeat to maintain "live" status
    this.startHeartbeat();
    
    // Track page views
    this.trackCurrentPageView();
    
    // Set up event listeners for page navigation
    this.setupEventListeners();

    // Handle window close/navigation to track exit
    window.addEventListener('beforeunload', this.handleExit.bind(this));
  }

  // Track initial visit
  async trackVisit() {
    try {
      const response = await axios.post(this.endpoints.track, {
        shopId: this.shopId,
        sessionId: this.sessionId
      });
      
      return response.data;
    } catch (error) {
      console.error('Error tracking visit:', error);
    }
  }

  // Start heartbeat interval (every 30 seconds)
  startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      if (!this.trackingEnabled) return;
      
      try {
        await axios.post(this.endpoints.heartbeat, {
          shopId: this.shopId,
          sessionId: this.sessionId
        });
      } catch (error) {
        console.error('Error sending heartbeat:', error);
      }
    }, 30000); // 30 seconds
  }

  // Track current page view
  async trackCurrentPageView() {
    try {
      // Check if we're entering checkout page
      const isCheckoutPage = this.isCheckoutPage(window.location.pathname);
      
      // If entering checkout, track it
      if (isCheckoutPage && !this.hasCheckoutState(this.checkoutStates.STARTED)) {
        this.markCheckoutStarted();
      }
      
      await axios.post(this.endpoints.pageView, {
        shopId: this.shopId,
        sessionId: this.sessionId,
        url: window.location.pathname
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  // Set up event listeners for SPA navigation
  setupEventListeners() {
    // For SPA navigation
    const originalPushState = window.history.pushState;
    window.history.pushState = function() {
      originalPushState.apply(this, arguments);
      window.dispatchEvent(new Event('locationchange'));
    };

    // Handle location changes
    window.addEventListener('locationchange', () => {
      if (this.currentPage !== window.location.pathname) {
        // Check if we're entering checkout page
        const isCheckoutPage = this.isCheckoutPage(window.location.pathname);
        
        // If entering checkout, track it
        if (isCheckoutPage && !this.hasCheckoutState(this.checkoutStates.STARTED)) {
          this.markCheckoutStarted();
        }
        
        this.currentPage = window.location.pathname;
        this.trackCurrentPageView();
      }
    });
  }

  // Check if current page is checkout
  isCheckoutPage(path) {
    return path.includes('/checkout') || path.includes('/payment');
  }

  // Get checkout state from localStorage
  hasCheckoutState(state) {
    const checkoutState = localStorage.getItem(`${this.sessionId}_${state}`);
    return checkoutState === 'true';
  }

  // Mark checkout as started (sets localStorage flag and tracks in backend)
  async markCheckoutStarted() {
    // Don't track if already completed or already started
    if (this.hasCheckoutState(this.checkoutStates.COMPLETED) || 
        this.hasCheckoutState(this.checkoutStates.STARTED)) {
      return;
    }
    
    // Set local flag
    localStorage.setItem(`${this.sessionId}_${this.checkoutStates.STARTED}`, 'true');
    
    // Track in backend
    await this.trackCheckoutAbandonment();
  }
  
  // Mark checkout as completed (both in localStorage and backend)
  async markCheckoutCompleted() {
    // Only mark as completed if it was previously started
    if (!this.hasCheckoutState(this.checkoutStates.STARTED)) {
      return;
    }
    
    // Set local flag
    localStorage.setItem(`${this.sessionId}_${this.checkoutStates.COMPLETED}`, 'true');
    
    // Notify backend about completion to decrement counter
    try {
      await axios.post(this.endpoints.checkoutCompleted, {
        shopId: this.shopId,
        sessionId: this.sessionId
      });
    } catch (error) {
      console.error('Error marking checkout completion:', error);
    }
  }

  // Reset checkout state (for new checkout attempts)
  resetCheckoutState() {
    localStorage.removeItem(`${this.sessionId}_${this.checkoutStates.STARTED}`);
    localStorage.removeItem(`${this.sessionId}_${this.checkoutStates.COMPLETED}`);
  }

  // Track cart abandonment
  async trackCartAbandonment() {
    try {
      await axios.post(this.endpoints.cartAbandonment, {
        shopId: this.shopId,
        sessionId: this.sessionId
      });
    } catch (error) {
      console.error('Error tracking cart abandonment:', error);
    }
  }

  // Track checkout abandonment
  async trackCheckoutAbandonment() {
    try {
      await axios.post(this.endpoints.checkoutAbandonment, {
        shopId: this.shopId,
        sessionId: this.sessionId
      });
    } catch (error) {
      console.error('Error tracking checkout abandonment:', error);
    }
  }

  // Get shop stats
  async getShopStats() {
    try {
      const response = await axios.get(`${this.endpoints.stats}${this.shopId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting shop stats:', error);
      return null;
    }
  }

  // Handle user exit (beforeunload)
// In visitorTracker.js handleExit method
async handleExit(event) {
  const duration = Math.floor((Date.now() - this.pageLoadTime) / 1000);
  
  if (this.heartbeatInterval) {
    clearInterval(this.heartbeatInterval);
  }
  
  try {
    // Make sure the payload is correctly formatted
    const payload = {
      shopId: this.shopId,
      sessionId: this.sessionId,
      duration: duration
    };
    
    // Use sendBeacon with proper encoding
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.endpoints.end, blob);
    } else {
      // Fallback to synchronous XHR
      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.endpoints.end, false);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(payload));
    }
  } catch (error) {
    console.error('Error ending visit:', error);
  }
}

  // Clean up and end tracking
  cleanup() {
    this.trackingEnabled = false;
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    window.removeEventListener('beforeunload', this.handleExit.bind(this));
  }
}

// Export singleton instance
const visitorTracker = new VisitorTracker();
export default visitorTracker;  