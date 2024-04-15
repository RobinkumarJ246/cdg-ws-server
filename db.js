// db.js
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://admin4321:iceberginflorida@cluster0.7nzmtv3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

const connectToMongoDB = async () => {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }
};

const getDatabase = () => {
  return client.db('chatdatagen');
};

module.exports = { connectToMongoDB, getDatabase };