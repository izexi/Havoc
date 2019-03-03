require("require-dir")("./extensions");

const HavoClient = require("./Havoc");
module.exports = new HavoClient();
