const mongoose = require("mongoose");

const localUri = "mongodb://127.0.0.1:27017/pos-db";

console.log("Attempting to connect to local MongoDB:", localUri);

mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 })
  .then(() => {
    console.log("✅ Local Connection Successful!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Local Connection Failed!");
    process.exit(1);
  });
