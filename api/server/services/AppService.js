const {
  FileSources,
  
  EModelEndpoint,
  
  
  
} = require('librechat-data-provider');
const { agentsConfigSetup } = require('@librechat/api');
const {
  checkHealth,
  checkConfig,
  checkVariables,
  checkAzureVariables,
  checkWebSearchConfig,
} = require('./start/checks');
const { azureAssistantsDefaults, assistantsConfigSetup } = require('./start/assistants');
const { initializeAzureBlobService } = require('./Files/Azure/initialize');
const { initializeFirebase } = require('./Files/Firebase/initialize');
const loadCustomConfig = require('./Config/loadCustomConfig');
const handleRateLimits = require('./Config/handleRateLimits');
const { loadDefaultInterface } = require('./start/interface');
const { loadTurnstileConfig } = require('./start/turnstile');
const { azureConfigSetup } = require('./start/azureOpenAI');
const { processModelSpecs } = require('./start/modelSpecs');
const { initializeS3 } = require('./Files/S3/initialize');
const { loadAndFormatTools } = require('./ToolService');
const { isEnabled } = require('~/server/utils');
const { initializeRoles } = require('~/models');
const { setCachedTools } = require('./Config');
const paths = require('~/config/paths');

/**
 * Loads custom config and initializes app-wide variables.
 * @function AppService
 * @param {Express.Application} app - The Express application object.
 */
const AppService = async (app) => {
  await initializeRoles();
  /** @type {TCustomConfig} */
  const config = (await loadCustomConfig()) ?? {};
  const configDefaults = {
    interface: {
      endpointsMenu: true,
      modelSelect: true,
      parameters: true,
      presets: true,
      privacyPolicy: {
        externalUrl: 'https://librechat.ai/privacy-policy',
        openNewTab: true,
      },
      termsOfService: {
        externalUrl: 'https://librechat.ai/tos',
        openNewTab: true,
        modalAcceptance: true,
        modalTitle: 'Terms of Service for LibreChat',
        modalContent: '# Terms and Conditions for LibreChat\n\n*Effective Date: February 18, 2024*\n\nWelcome to LibreChat, the informational website for the open-source AI chat platform, available at https://librechat.ai. These Terms of Service ("Terms") govern your use of our website and the services we offer. By accessing or using the Website, you agree to be bound by these Terms and our Privacy Policy, accessible at https://librechat.ai//privacy.\n\n## 1. Ownership\n\nUpon purchasing a package from LibreChat, you are granted the right to download and use the code for accessing an admin panel for LibreChat. While you own the downloaded code, you are expressly prohibited from reselling, redistributing, or otherwise transferring the code to third parties without explicit permission from LibreChat.\n\n## 2. User Data\n\nWe collect personal data, such as your name, email address, and payment information, as described in our Privacy Policy. This information is collected to provide and improve our services, process transactions, and communicate with you.\n\n## 3. Non-Personal Data Collection\n\nThe Website uses cookies to enhance user experience, analyze site usage, and facilitate certain functionalities. By using the Website, you consent to the use of cookies in accordance with our Privacy Policy.\n\n## 4. Use of the Website\n\nYou agree to use the Website only for lawful purposes and in a manner that does not infringe the rights of, restrict, or inhibit anyone else\'s use and enjoyment of the Website. Prohibited behavior includes harassing or causing distress or inconvenience to any person, transmitting obscene or offensive content, or disrupting the normal flow of dialogue within the Website.\n\n## 5. Governing Law\n\nThese Terms shall be governed by and construed in accordance with the laws of the United States, without giving effect to any principles of conflicts of law.\n\n## 6. Changes to the Terms\n\nWe reserve the right to modify these Terms at any time. We will notify users of any changes by email. Your continued use of the Website after such changes have been notified will constitute your consent to such changes.\n\n## 7. Contact Information\n\nIf you have any questions about these Terms, please contact us at contact@librechat.ai.\n\nBy using the Website, you acknowledge that you have read these Terms of Service and agree to be bound by them.\n',
      },
      mcpServers: {
        placeholder: 'MCP Servers',
      },
      bookmarks: true,
      memories: false,
      prompts: true,
      multiConvo: true,
      agents: true,
      temporaryChat: true,
      runCode: true,
      webSearch: true,
      customWelcome: 'Welcome to LibreChat! Enjoy your experience.',
    },
  };

  const ocr = config.ocr || {};
  const webSearch = config.webSearch || {};
  checkWebSearchConfig(webSearch);
  const memory = config.memory || {};
  const filteredTools = config.filteredTools;
  const includedTools = config.includedTools;
  const fileStrategy = config.fileStrategy ?? "local";
  const startBalance = process.env.START_BALANCE;
  const balance = config.balance ?? {
    enabled: isEnabled(process.env.CHECK_BALANCE),
    startBalance: startBalance ? parseInt(startBalance, 10) : undefined,
  };
  const imageOutputType = config?.imageOutputType ?? "jpeg";

  process.env.CDN_PROVIDER = fileStrategy;

  checkVariables();
  await checkHealth();

  if (fileStrategy === FileSources.firebase) {
    initializeFirebase();
  } else if (fileStrategy === FileSources.azure_blob) {
    initializeAzureBlobService();
  } else if (fileStrategy === FileSources.s3) {
    initializeS3();
  }

  /** @type {Record<string, FunctionTool>} */
  const availableTools = loadAndFormatTools({
    adminFilter: filteredTools,
    adminIncluded: includedTools,
    directory: paths.structuredTools,
  });

  await setCachedTools(availableTools, { isGlobal: true });

  // Store MCP config for later initialization
  const mcpConfig = config.mcpServers || null;

  const socialLogins =
    config?.registration?.socialLogins ?? [];
  const interfaceConfig = await loadDefaultInterface(config, configDefaults);
  const turnstileConfig = loadTurnstileConfig(config, configDefaults);

  const defaultLocals = {
    ocr,
    paths,
    memory,
    webSearch,
    fileStrategy,
    socialLogins,
    filteredTools,
    includedTools,
    imageOutputType,
    interfaceConfig,
    turnstileConfig,
    balance,
    mcpConfig,
  };

  const agentsDefaults = agentsConfigSetup(config);

  if (!Object.keys(config).length) {
    app.locals = {
      ...defaultLocals,
      // Only xAI is enabled - no agents endpoint
    };
    return;
  }

  checkConfig(config);
  handleRateLimits(config?.rateLimits);

  const endpointLocals = {};
  const endpoints = config?.endpoints;

  // Only xAI is enabled - all other endpoints are disabled
  // No endpoint initialization for other endpoints

  app.locals = {
    ...defaultLocals,
    fileConfig: config?.fileConfig,
    secureImageLinks: config?.secureImageLinks,
    modelSpecs: processModelSpecs(endpoints, config.modelSpecs, interfaceConfig),
    // Only xAI endpoints are available
  };
};

module.exports = AppService;
