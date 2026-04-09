const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const uri = process.env.MONGODB_URI;

console.log("Attempting to connect to:", uri.replace(/:([^@]+)@/, ":****@")); // Hide password

mongoose.connect(uri)
  .then(() => {
    console.log("✅ Connection Successful!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection Failed!");
    console.error(err);
    process.exit(1);
  });
