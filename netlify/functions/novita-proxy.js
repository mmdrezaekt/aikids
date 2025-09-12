const https = require('https');

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

      const postData = JSON.stringify(requestBody);
      
      const options = {
        hostname: 'api.novita.ai',
        port: 443,
        path: '/v3/async/qwen-image-txt2img',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer sk_WHtMEr6fX8C6OStB14DhDZ7aKD1gbi_r5hHZ4JKtZYk',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const response = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              data: data
            });
          });
        });

        req.on('error', (error) => {
          reject(error);
        });

        req.write(postData);
        req.end();
      });

      if (response.statusCode !== 200) {
        throw new Error(`Novita API error: ${response.statusCode}`);
      }

      const data = JSON.parse(response.data);

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

      const options = {
        hostname: 'api.novita.ai',
        port: 443,
        path: `/v3/async/task-result?task_id=${task_id}`,
        method: 'GET',
        headers: {
          'Authorization': 'Bearer sk_WHtMEr6fX8C6OStB14DhDZ7aKD1gbi_r5hHZ4JKtZYk'
        }
      };

      const response = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              data: data
            });
          });
        });

        req.on('error', (error) => {
          reject(error);
        });

        req.end();
      });

      if (response.statusCode !== 200) {
        throw new Error(`Novita API error: ${response.statusCode}`);
      }

      const data = JSON.parse(response.data);

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
