const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.Mongo_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed", error.message);
    process.exit(1);
  }
};

module.exports = connectDb;
