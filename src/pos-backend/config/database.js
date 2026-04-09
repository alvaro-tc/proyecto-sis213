const mongoose = require("mongoose");
const config = require("./config");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.databaseURI, {
            serverSelectionTimeoutMS: 5000, // Tiempo de espera máximo 5s
            family: 4, // Fuerza la resolución de DNS por IPv4 en Node >= 18 para evitar errores SSL y de red
            tls: true
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(`⚠️  Database connection failed: ${error.message}`);
        console.log(`⚠️  The server will continue to run, but database-dependent features will fail.\nPor favor, verifica que tu IP (0.0.0.0/0) esté permitida en la configuración de Network Access en MongoDB Atlas.`);
    }
}

module.exports = connectDB;