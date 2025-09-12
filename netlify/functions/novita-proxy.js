const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: '',
    };
  }

  try {
    const { httpMethod, path, headers, body } = event;
    
    // Extract the path after /novita/
    const apiPath = path.replace('/.netlify/functions/novita-proxy', '');
    const targetUrl = `https://api.novita.ai${apiPath}`;
    
    console.log('Proxying request to:', targetUrl);
    
    const response = await fetch(targetUrl, {
      method: httpMethod,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': headers.authorization || '',
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
