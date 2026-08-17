const mongoose = require("mongoose");

let connectionPromise;

const connectDb = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.Mongo_URI) {
    throw new Error("Mongo_URI is not configured");
  }

  // Reuse a single connection across warm serverless invocations.
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.Mongo_URI, { serverSelectionTimeoutMS: 10000 })
      .then((connection) => {
        console.log("Database connected successfully");
        return connection;
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
};

module.exports = connectDb;
