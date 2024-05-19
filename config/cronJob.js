import cron from 'node-cron';
import https from 'https';

const job = cron.schedule('*/1 * * * *', () => {
  console.log('Pinging frontend to keep it alive...');

  const options = {
    hostname: 'fotomate.vercel.app',
    port: 443, // Port for HTTPS
    path: '/', // Path to your frontend endpoint, if needed
    method: 'GET',
    timeout: 60000 // Timeout after 1 minute (60000 ms)
  };

  const req = https.request(options, (res) => {
    console.log(`Ping response: ${res.statusCode}`);
  });

  req.on('timeout', () => {
    req.abort(); 
    console.error('Request timed out');
  });

  req.on('error', (err) => {
    console.error('Ping error:', err.message);
  });

  req.end();
});

export default job;