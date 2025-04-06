const path = require('node:path');

const winston = require('winston');
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  format: format.combine(
    format.splat(),
    // format.simple()
    format.json(),
  ),
  transports: [
    // new winston.transports.Console({ json: true, colorize: true }),
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log')
    })
  ]
});

module.exports = logger;
