import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Artifact } from './Artifact';

// Mock pentru dependențele complexe
const MockProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background text-text-primary p-4">
      {children}
    </div>
  );
};

const meta: Meta<typeof Artifact> = {
  title: 'Artifacts/Artifact',
  component: Artifact,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MockProviders>
        <Story />
      </MockProviders>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'My Artifact',
    type: 'code',
    identifier: 'example',
    children: 'console.log("Hello World");',
    node: null,
  },
};

export const WithLongContent: Story = {
  args: {
    title: 'Long Code Example',
    type: 'code',
    identifier: 'long-example',
    children: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`,
    node: null,
  },
};

export const HTMLArtifact: Story = {
  args: {
    title: 'HTML Example',
    type: 'html',
    identifier: 'html-example',
    children: '<div class="container"><h1>Hello World</h1><p>This is a test</p></div>',
    node: null,
  },
};

export const MarkdownArtifact: Story = {
  args: {
    title: 'Markdown Example',
    type: 'markdown',
    identifier: 'markdown-example',
    children: '# Hello World\n\nThis is a **markdown** example with some *formatting*.',
    node: null,
  },
};

