// Compat shim — el subsistema real vive en ./whatsapp/. Mantenemos este archivo para no
// romper imports existentes (orderController, groqController, whatsappController).
module.exports = require("./whatsapp");
