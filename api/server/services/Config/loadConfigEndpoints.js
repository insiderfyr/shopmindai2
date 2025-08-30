const { EModelEndpoint, extractEnvVariable } = require('librechat-data-provider');
const { isUserProvided, normalizeEndpointName } = require('~/server/utils');
const { getCustomConfig } = require('./getCustomConfig');

/**
 * Load config endpoints from the cached configuration object
 * @param {Express.Request} req - The request object
 * @returns {Promise<TEndpointsConfig>} A promise that resolves to an object containing the endpoints configuration
 */
async function loadConfigEndpoints(req) {
  const customConfig = await getCustomConfig();

  if (!customConfig) {
    return {};
  }

  const { endpoints = {} } = customConfig ?? {};
  const endpointsConfig = {};

  // Only process xAI custom endpoints - ignore all others
  if (Array.isArray(endpoints[EModelEndpoint.custom])) {
    const customEndpoints = endpoints[EModelEndpoint.custom].filter(
      (endpoint) =>
        endpoint.baseURL &&
        endpoint.apiKey &&
        endpoint.name &&
        endpoint.models &&
        (endpoint.models.fetch || endpoint.models.default) &&
        endpoint.name.toLowerCase() === 'xai', // Only xAI
    );

    for (let i = 0; i < customEndpoints.length; i++) {
      const endpoint = customEndpoints[i];
      const {
        baseURL,
        apiKey,
        name: configName,
        iconURL,
        modelDisplayLabel,
        customParams,
      } = endpoint;
      const name = normalizeEndpointName(configName);

      const resolvedApiKey = extractEnvVariable(apiKey);
      const resolvedBaseURL = extractEnvVariable(baseURL);

      endpointsConfig[name] = {
        type: EModelEndpoint.custom,
        userProvide: isUserProvided(resolvedApiKey),
        userProvideURL: isUserProvided(resolvedBaseURL),
        modelDisplayLabel,
        iconURL,
        customParams,
      };
    }
  }

  // All other endpoints are disabled
  return endpointsConfig;
}

module.exports = loadConfigEndpoints;
