exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      },
      body: '',
    };
  }

  // Only allow POST and GET requests
  if (!['POST', 'GET'].includes(event.httpMethod)) {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    if (event.httpMethod === 'POST') {
      // Create image generation task
      const requestBody = JSON.parse(event.body);
      
      if (!requestBody.prompt) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ error: 'Prompt is required' }),
        };
      }

      const response = await fetch('https://api.novita.ai/v3/async/qwen-image-txt2img', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer sk_WHtMEr6fX8C6OStB14DhDZ7aKD1gbi_r5hHZ4JKtZYk',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Novita API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      };

    } else if (event.httpMethod === 'GET') {
      // Get task result
      const { task_id } = event.queryStringParameters || {};
      
      if (!task_id) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ error: 'task_id is required' }),
        };
      }

      const response = await fetch(`https://api.novita.ai/v3/async/task-result?task_id=${task_id}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer sk_WHtMEr6fX8C6OStB14DhDZ7aKD1gbi_r5hHZ4JKtZYk'
        }
      });

      if (!response.ok) {
        throw new Error(`Novita API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      };
    }

  } catch (error) {
    console.error('Novita proxy error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
    };
  }
};
