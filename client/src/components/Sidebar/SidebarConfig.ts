// Sidebar Configuration and Themes

export interface SidebarConfig {
  // Layout settings
  collapsedWidth: number;
  expandedWidth: number;
  animationDuration: number;
  hoverDelay: number;
  
  // Visual settings
  borderRadius: string;
  shadow: string;
  backdropBlur: string;
  
  // Colors
  colors: {
    background: string;
    border: string;
    text: {
      primary: string;
      secondary: string;
      active: string;
    };
    icon: {
      primary: string;
      secondary: string;
      active: string;
    };
    hover: {
      background: string;
      border: string;
    };
    active: {
      background: string;
      border: string;
    };
  };
  
  // Responsive breakpoints
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  
  // Navigation items configuration
  navigation: {
    showBadges: boolean;
    showActiveIndicator: boolean;
    showExpandIndicator: boolean;
    itemsPerSection: number;
  };
}

// Default configuration
export const defaultSidebarConfig: SidebarConfig = {
  collapsedWidth: 80,
  expandedWidth: 256,
  animationDuration: 300,
  hoverDelay: 300,
  
  borderRadius: 'rounded-xl',
  shadow: 'shadow-sm',
  backdropBlur: 'backdrop-blur-md',
  
  colors: {
    background: 'bg-gray-50 dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
    text: {
      primary: 'text-gray-900 dark:text-white',
      secondary: 'text-gray-700 dark:text-gray-300',
      active: 'text-blue-600 dark:text-blue-400',
    },
    icon: {
      primary: 'text-gray-600 dark:text-gray-400',
      secondary: 'text-gray-500 dark:text-gray-500',
      active: 'text-blue-600 dark:text-blue-400',
    },
    hover: {
      background: 'hover:bg-white/60 dark:hover:bg-gray-700/60',
      border: 'hover:border-blue-300 dark:hover:border-blue-600',
    },
    active: {
      background: 'bg-white/80 dark:bg-gray-700/80',
      border: 'border-blue-300 dark:border-blue-600',
    },
  },
  
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
  },
  
  navigation: {
    showBadges: true,
    showActiveIndicator: true,
    showExpandIndicator: true,
    itemsPerSection: 6,
  },
};

// Light theme configuration
export const lightThemeConfig: Partial<SidebarConfig> = {
  colors: {
    background: 'bg-white',
    border: 'border-gray-200',
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      active: 'text-blue-600',
    },
    icon: {
      primary: 'text-gray-600',
      secondary: 'text-gray-500',
      active: 'text-blue-600',
    },
    hover: {
      background: 'hover:bg-gray-50',
      border: 'hover:border-blue-300',
    },
    active: {
      background: 'bg-blue-50',
      border: 'border-blue-300',
    },
  },
};

// Dark theme configuration
export const darkThemeConfig: Partial<SidebarConfig> = {
  colors: {
    background: 'bg-gray-900',
    border: 'border-gray-700',
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      active: 'text-blue-400',
    },
    icon: {
      primary: 'text-gray-400',
      secondary: 'text-gray-500',
      active: 'text-blue-400',
    },
    hover: {
      background: 'hover:bg-gray-800',
      border: 'hover:border-blue-600',
    },
    active: {
      background: 'bg-blue-900/20',
      border: 'border-blue-600',
    },
  },
};

// High contrast theme configuration
export const highContrastConfig: Partial<SidebarConfig> = {
  colors: {
    background: 'bg-black',
    border: 'border-white',
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      active: 'text-yellow-400',
    },
    icon: {
      primary: 'text-white',
      secondary: 'text-gray-400',
      active: 'text-yellow-400',
    },
    hover: {
      background: 'hover:bg-gray-900',
      border: 'hover:border-yellow-400',
    },
    active: {
      background: 'bg-yellow-900/30',
      border: 'border-yellow-400',
    },
  },
  shadow: 'shadow-lg',
  borderRadius: 'rounded-none',
};

// Compact layout configuration
export const compactConfig: Partial<SidebarConfig> = {
  collapsedWidth: 64,
  expandedWidth: 200,
  animationDuration: 200,
  hoverDelay: 200,
  navigation: {
    ...defaultSidebarConfig.navigation,
    itemsPerSection: 4,
  },
};

// Wide layout configuration
export const wideConfig: Partial<SidebarConfig> = {
  collapsedWidth: 96,
  expandedWidth: 320,
  animationDuration: 400,
  hoverDelay: 400,
  navigation: {
    ...defaultSidebarConfig.navigation,
    itemsPerSection: 8,
  },
};

// Utility functions for configuration
export const createCustomConfig = (
  overrides: Partial<SidebarConfig>
): SidebarConfig => {
  return {
    ...defaultSidebarConfig,
    ...overrides,
    colors: {
      ...defaultSidebarConfig.colors,
      ...overrides.colors,
      text: {
        ...defaultSidebarConfig.colors.text,
        ...overrides.colors?.text,
      },
      icon: {
        ...defaultSidebarConfig.colors.icon,
        ...overrides.colors?.icon,
      },
      hover: {
        ...defaultSidebarConfig.colors.hover,
        ...overrides.colors?.hover,
      },
      active: {
        ...defaultSidebarConfig.colors.active,
        ...overrides.colors?.active,
      },
    },
  };
};

export const getResponsiveConfig = (
  config: SidebarConfig,
  screenWidth: number
): Partial<SidebarConfig> => {
  if (screenWidth < config.breakpoints.mobile) {
    return {
      collapsedWidth: 0,
      expandedWidth: screenWidth,
      animationDuration: 150,
      hoverDelay: 0,
    };
  }
  
  if (screenWidth < config.breakpoints.tablet) {
    return {
      collapsedWidth: 64,
      expandedWidth: 200,
      animationDuration: 250,
      hoverDelay: 200,
    };
  }
  
  return config;
};

// Export all configurations
export const sidebarConfigs = {
  default: defaultSidebarConfig,
  light: lightThemeConfig,
  dark: darkThemeConfig,
  highContrast: highContrastConfig,
  compact: compactConfig,
  wide: wideConfig,
};
