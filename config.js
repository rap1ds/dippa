var config = {};

config.profile = process.env.NODE_ENV || "development";

// Loggly
config.loggly = {};
config.loggly.token = process.env.LOGGLY_TOKEN || null;

module.exports = config;