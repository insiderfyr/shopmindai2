const {
  CacheKeys,
  EModelEndpoint,
  isAgentsEndpoint,
  orderEndpointsConfig,
  defaultAgentCapabilities,
} = require('librechat-data-provider');
const loadDefaultEndpointsConfig = require('./loadDefaultEConfig');
const loadConfigEndpoints = require('./loadConfigEndpoints');
const getLogStores = require('~/cache/getLogStores');

/**
 *
 * @param {ServerRequest} req
 * @returns {Promise<TEndpointsConfig>}
 */
async function getEndpointsConfig(req) {
  const cache = getLogStores(CacheKeys.CONFIG_STORE);
  const cachedEndpointsConfig = await cache.get(CacheKeys.ENDPOINT_CONFIG);
  if (cachedEndpointsConfig) {
    return cachedEndpointsConfig;
  }

  const defaultEndpointsConfig = await loadDefaultEndpointsConfig(req);
  const customConfigEndpoints = await loadConfigEndpoints(req);

  /** @type {TEndpointsConfig} */
  const mergedConfig = { ...defaultEndpointsConfig, ...customConfigEndpoints };
  
  // Only xAI is enabled - ignore all other endpoint configurations
  // No processing for assistants, agents, azureAssistants, bedrock, etc.

  const endpointsConfig = orderEndpointsConfig(mergedConfig);

  await cache.set(CacheKeys.ENDPOINT_CONFIG, endpointsConfig);
  return endpointsConfig;
}

/**
 * @param {ServerRequest} req
 * @param {import('librechat-data-provider').AgentCapabilities} capability
 * @returns {Promise<boolean>}
 */
const checkCapability = async (req, capability) => {
  const isAgents = isAgentsEndpoint(req.body?.original_endpoint || req.body?.endpoint);
  const endpointsConfig = await getEndpointsConfig(req);
  const capabilities =
    isAgents || endpointsConfig?.[EModelEndpoint.agents]?.capabilities != null
      ? (endpointsConfig?.[EModelEndpoint.agents]?.capabilities ?? [])
      : defaultAgentCapabilities;
  return capabilities.includes(capability);
};

module.exports = { getEndpointsConfig, checkCapability };
