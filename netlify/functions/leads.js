exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
  try {
    const lead = JSON.parse(event.body);
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, lead })
    };
  } catch (err) {
    return { statusCode: 400, body: 'Invalid data' };
  }
};
