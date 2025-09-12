// API Proxy for CORS issues
(function() {
  // This is a simple proxy to handle CORS issues
  // In production, you should use a proper backend service
  
  if (window.location.hostname === 'aikidsapp.netlify.app') {
    // Override fetch for API calls
    const originalFetch = window.fetch;
    
    window.fetch = function(url, options) {
      // Handle OpenRouter API calls
      if (url.includes('openrouter.ai')) {
        return originalFetch(url, options);
      }
      
      // Handle Novita API calls
      if (url.includes('api.novita.ai')) {
        return originalFetch(url, options);
      }
      
      // Handle Firebase calls
      if (url.includes('firebase') || url.includes('googleapis.com')) {
        return originalFetch(url, options);
      }
      
      return originalFetch(url, options);
    };
  }
})();
