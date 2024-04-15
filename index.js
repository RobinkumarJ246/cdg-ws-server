const WebSocket = require('ws');
const cors = require('cors');
const { connectToMongoDB, getDatabase } = require('./db');

const wss = new WebSocket.Server({
  port: 8080,
  // Add CORS options
  cors: {
    origin: ['*'], // Replace with your client domain or use ['*'] to allow all origins
    methods: ['GET', 'POST'], // Add the HTTP methods you want to allow
  },
});

connectToMongoDB();

wss.on('connection', (ws, req) => {
  console.log('New client connected');

  // Implement a simple CORS handshake
  if (req.headers.origin) {
    const requestOrigin = req.headers.origin;
    const allowedOrigins = ['https://your-client-domain.com', 'http://localhost:3000']; // Add your client domains here

    if (allowedOrigins.includes(requestOrigin)) {
      ws.sendData = (data) => {
        ws.send(data, { binary: true }, (err) => {
          if (err) {
            console.error('Error sending data:', err);
          }
        });
      };
    } else {
      ws.close();
      console.log('Connection denied from origin:', requestOrigin);
    }
  }

  ws.on('message', async (data) => {
    const message = JSON.parse(data);
    const db = getDatabase();
    const collection = db.collection('rooms');

    try {
      await collection.insertOne(message);
      console.log('Message saved to MongoDB');

      // Broadcast the message to all connected clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.sendData(JSON.stringify(message));
        }
      });
    } catch (err) {
      console.error(err);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server started on port 8080');