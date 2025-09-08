const { isUserProvided } = require('@librechat/api');
const { EModelEndpoint } = require('librechat-data-provider');
const { generateConfig } = require('~/server/utils/handleText');

const {
  OPENAI_API_KEY: openAIApiKey,
  AZURE_ASSISTANTS_API_KEY: azureAssistantsApiKey,
  ASSISTANTS_API_KEY: assistantsApiKey,
  AZURE_API_KEY: azureOpenAIApiKey,
  ANTHROPIC_API_KEY: anthropicApiKey,
  CHATGPT_TOKEN: chatGPTToken,
  PLUGINS_USE_AZURE,
  GOOGLE_KEY: googleKey,
  OPENAI_REVERSE_PROXY,
  AZURE_OPENAI_BASEURL,
  ASSISTANTS_BASE_URL,
  AZURE_ASSISTANTS_BASE_URL,
} = process.env ?? {};

const useAzurePlugins = !!PLUGINS_USE_AZURE;

const userProvidedOpenAI = useAzurePlugins
  ? isUserProvided(azureOpenAIApiKey)
  : isUserProvided(openAIApiKey);

module.exports = {
  config: {
    // Disable all endpoints except xAI
    openAIApiKey: null,
    azureOpenAIApiKey: null,
    useAzurePlugins: false,
    userProvidedOpenAI: false,
    googleKey: null,
    [EModelEndpoint.anthropic]: null,
    [EModelEndpoint.chatGPTBrowser]: null,
    [EModelEndpoint.openAI]: null,
    [EModelEndpoint.azureOpenAI]: null,
    [EModelEndpoint.assistants]: null,
    [EModelEndpoint.azureAssistants]: null,
    [EModelEndpoint.bedrock]: null,
    /* Disable agents endpoint to prevent "Agent not found" errors */
    [EModelEndpoint.agents]: null,
  },
};
