const logger = require('../utils/logger.js');

module.exports = async function(err, req, res, next) {
  logger.error(err.stack);
  console.log(err.stack);

  let responseData = {
    error: err.message,
    from: "error middleware"
  };

  res.status(500).send(responseData);
};
