#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Component directories to scan
const COMPONENT_DIRS = [
  'src/components/ui',
  'src/components/Auth',
  'src/components/Chat',
  'src/components/Nav',
  'src/components/Prompts',
  'src/components/Files',
  'src/components/Endpoints',
  'src/components/Plugins',
  'src/components/Share',
  'src/components/Input',
  'src/components/Messages',
  'src/components/Conversations',
  'src/components/Artifacts',
  'src/components/Audio',
  'src/components/Banners',
  'src/components/Sidebar',
  'src/components/Tools',
  'src/components/Web',
];

// Skip these files/directories
const SKIP_PATTERNS = [
  /\.stories\./,
  /\.spec\./,
  /\.test\./,
  /index\.ts$/,
  /README\.md$/,
  /\.css$/,
  /\.scss$/,
  /\.sass$/,
  /\.less$/,
  /node_modules/,
];

// Component templates
const STORY_TEMPLATE = `import type { Meta, StoryObj } from '@storybook/react';
import { {{componentName}} } from './{{fileName}}';

const meta: Meta<typeof {{componentName}}> = {
  title: '{{category}}/{{componentName}}',
  component: {{componentName}},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Add controls for your props here
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <{{componentName}} />
    </div>
  ),
};
`;

const COMPLEX_STORY_TEMPLATE = `import type { Meta, StoryObj } from '@storybook/react';
import { {{componentName}} } from './{{fileName}}';

const meta: Meta<typeof {{componentName}}> = {
  title: '{{category}}/{{componentName}}',
  component: {{componentName}},
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    // Add controls for your props here
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};

export const WithMockData: Story = {
  args: {
    // Add mock data props here
  },
};
`;

// Complex components that need special handling
const COMPLEX_COMPONENTS = [
  'ChatView',
  'PromptsView',
  'Settings',
  'AuthLayout',
  'Sidebar',
  'MessagesView',
  'PromptForm',
];

function getComponentName(fileName) {
  return fileName.replace(/\.(tsx|ts|jsx|js)$/, '');
}

function getCategory(dirPath) {
  const parts = dirPath.split('/');
  const componentDir = parts[parts.length - 1];
  
  switch (componentDir) {
    case 'ui':
      return 'UI';
    case 'Auth':
      return 'Auth';
    case 'Chat':
      return 'Chat';
    case 'Nav':
      return 'Navigation';
    case 'Prompts':
      return 'Prompts';
    case 'Files':
      return 'Files';
    case 'Endpoints':
      return 'Endpoints';
    case 'Plugins':
      return 'Plugins';
    case 'Share':
      return 'Share';
    case 'Input':
      return 'Input';
    case 'Messages':
      return 'Messages';
    case 'Conversations':
      return 'Conversations';
    case 'Artifacts':
      return 'Artifacts';
    case 'Audio':
      return 'Audio';
    case 'Banners':
      return 'Banners';
    case 'Sidebar':
      return 'Sidebar';
    case 'Tools':
      return 'Tools';
    case 'Web':
      return 'Web';
    default:
      return 'Components';
  }
}

function shouldSkipFile(fileName) {
  return SKIP_PATTERNS.some(pattern => pattern.test(fileName));
}

function isComplexComponent(componentName) {
  return COMPLEX_COMPONENTS.includes(componentName);
}

function generateStory(componentPath, fileName) {
  const componentName = getComponentName(fileName);
  const category = getCategory(path.dirname(componentPath));
  const storyFileName = `${componentName}.stories.tsx`;
  const storyPath = path.join(path.dirname(componentPath), storyFileName);
  
  // Skip if story already exists
  if (fs.existsSync(storyPath)) {
    console.log(`Skipping ${storyFileName} - already exists`);
    return;
  }
  
  const template = isComplexComponent(componentName) ? COMPLEX_STORY_TEMPLATE : STORY_TEMPLATE;
  const storyContent = template
    .replace(/{{componentName}}/g, componentName)
    .replace(/{{fileName}}/g, fileName)
    .replace(/{{category}}/g, category);
  
  fs.writeFileSync(storyPath, storyContent);
  console.log(`Created story: ${storyPath}`);
}

function scanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory does not exist: ${dirPath}`);
    return;
  }
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      scanDirectory(itemPath);
    } else if (stat.isFile() && /\.(tsx|ts|jsx|js)$/.test(item) && !shouldSkipFile(item)) {
      generateStory(itemPath, item);
    }
  }
}

function main() {
  console.log('🚀 Generating Storybook stories for all components...\n');
  
  const projectRoot = path.join(__dirname, '..');
  
  for (const dir of COMPONENT_DIRS) {
    const fullPath = path.join(projectRoot, dir);
    console.log(`📁 Scanning directory: ${dir}`);
    scanDirectory(fullPath);
  }
  
  console.log('\n✅ Story generation complete!');
  console.log('\n📖 To view your stories, run: npm run storybook');
}

main();
