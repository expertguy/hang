// apiAdapter.js
// This is a wrapper for components to use with the visitor tracker

import ApiFunction from "./api/apiFuntions";


const createApiAdapter = () => {
  const { get, post } = ApiFunction();
  
  return {
    // Wrapper for tracking visitor activity
    trackVisit: async (shopId, sessionId) => {
      try {
        return await post('/visitor/track', { shopId, sessionId });
      } catch (error) {
        console.error('Error tracking visit:', error);
        return { success: false, message: error.message };
      }
    },
    
    // Send heartbeat
    sendHeartbeat: async (shopId, sessionId) => {
      try {
        return await post('/visitor/heartbeat', { shopId, sessionId });
      } catch (error) {
        console.error('Error sending heartbeat:', error);
        return { success: false, message: error.message };
      }
    },
    
    // Track page view
    trackPageView: async (shopId, sessionId, url) => {
      try {
        return await post('/visitor/page-view', { shopId, sessionId, url });
      } catch (error) {
        console.error('Error tracking page view:', error);
        return { success: false, message: error.message };
      }
    },
    
    // Track cart abandonment
    trackCartAbandonment: async (shopId, sessionId) => {
      try {
        return await post('/visitor/cart-abandonment', { shopId, sessionId });
      } catch (error) {
        console.error('Error tracking cart abandonment:', error);
        return { success: false, message: error.message };
      }
    },
    
    // Track checkout abandonment
    trackCheckoutAbandonment: async (shopId, sessionId) => {
      try {
        return await post('/visitor/checkout-abandonment', { shopId, sessionId });
      } catch (error) {
        console.error('Error tracking checkout abandonment:', error);
        return { success: false, message: error.message };
      }
    },
    
    // End visit
    endVisit: async (shopId, sessionId, duration) => {
      try {
        return await post('/visitor/end', { shopId, sessionId, duration });
      } catch (error) {
        console.error('Error ending visit:', error);
        return { success: false, message: error.message };
      }
    },
    
    // Get shop stats
    getShopStats: async (shopId) => {
      try {
        return await get(`/visitor/stats/${shopId}`);
      } catch (error) {
        console.error('Error getting shop stats:', error);
        return { success: false, message: error.message };
      }
    }
  };
};

export default createApiAdapter;