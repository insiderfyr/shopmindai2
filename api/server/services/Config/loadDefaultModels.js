const { EModelEndpoint } = require('librechat-data-provider');
const { config } = require('./EndpointService');

/**
 * Load default models and return a configuration object
 * @param {Express.Request} req - The request object
 * @returns {Promise<Object.<string, string[]>>} An object whose keys are endpoint names and values are arrays of model names.
 */
async function loadDefaultModels(req) {
  // Only xAI is enabled - return empty object for all other endpoints
  const modelsConfig = {
    // All other endpoints are disabled - no models loaded
  };

  return modelsConfig;
}

module.exports = loadDefaultModels;
