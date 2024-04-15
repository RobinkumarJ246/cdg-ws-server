// server.js
const WebSocket = require('ws');
const { connectToMongoDB, getDatabase } = require('./db');

const wss = new WebSocket.Server({ port: 8080 });

connectToMongoDB();

wss.on('connection', (ws) => {
  console.log('New client connected');

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
          client.send(JSON.stringify(message));
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