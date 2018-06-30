const config = require(`./config.${process.env.NODE_ENV || 'development'}.json`)
module.exports = config
