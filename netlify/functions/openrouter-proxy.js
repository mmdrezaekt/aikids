const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, HTTP-Referer, X-Title',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: '',
    };
  }

  try {
    const { httpMethod, path, headers, body } = event;
    
    // Extract the path after /api/
    const apiPath = path.replace('/.netlify/functions/openrouter-proxy', '');
    const targetUrl = `https://openrouter.ai${apiPath}`;
    
    console.log('Proxying request to:', targetUrl);
    
    const response = await fetch(targetUrl, {
      method: httpMethod,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': headers.authorization || '',
        'HTTP-Referer': headers['http-referer'] || '',
        'X-Title': headers['x-title'] || 'AI Kids App',
      },
      body: body,
    });

    const data = await response.text();
    
    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: data,
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Proxy error' }),
    };
  }
};
