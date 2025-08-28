// 🚀 GENIUS-LEVEL TYPING ANIMATION CONFIGURATION

export interface TypingAnimationUserConfig {
  // Basic timing controls
  baseDelay: number;
  spaceDelay: number;
  punctuationDelay: number;
  newlineDelay: number;
  codeDelay: number;
  mathDelay: number;
  
  // Advanced features
  breathingEffect: boolean;
  smartPausing: boolean;
  adaptiveSpeed: boolean;
  highRefreshRate: boolean;
  predictiveGrouping: boolean;
  smoothScrolling: boolean;
  microInteractions: boolean;
  emojiSupport: boolean;
  
  // Performance settings
  maxGroupSize: number;
  frameRateLimit: number;
  memoryOptimization: boolean;
  
  // Visual effects
  cursorStyle: 'block' | 'line' | 'underline' | 'custom';
  cursorColor: string;
  breathingIntensity: number;
  hoverEffects: boolean;
  
  // Accessibility
  reduceMotion: boolean;
  highContrast: boolean;
  screenReaderSupport: boolean;
}

// 🚀 Default configuration for ultra-smooth performance
export const DEFAULT_TYPING_CONFIG: TypingAnimationUserConfig = {
  // Basic timing controls (optimized for smoothness)
  baseDelay: 8,
  spaceDelay: 2,
  punctuationDelay: 80,
  newlineDelay: 150,
  codeDelay: 15,
  mathDelay: 25,
  
  // Advanced features (all enabled for best experience)
  breathingEffect: true,
  smartPausing: true,
  adaptiveSpeed: true,
  highRefreshRate: true,
  predictiveGrouping: true,
  smoothScrolling: true,
  microInteractions: true,
  emojiSupport: true,
  
  // Performance settings
  maxGroupSize: 5,
  frameRateLimit: 0, // 0 = auto-detect
  memoryOptimization: true,
  
  // Visual effects
  cursorStyle: 'block',
  cursorColor: 'hsl(var(--primary))',
  breathingIntensity: 0.0008,
  hoverEffects: true,
  
  // Accessibility
  reduceMotion: false,
  highContrast: false,
  screenReaderSupport: true,
};

// 🚀 Performance presets for different devices
export const PERFORMANCE_PRESETS = {
  // Ultra-smooth for high-end devices
  ultra: {
    ...DEFAULT_TYPING_CONFIG,
    baseDelay: 6,
    maxGroupSize: 6,
    breathingIntensity: 0.001,
  },
  
  // Balanced for most devices
  balanced: {
    ...DEFAULT_TYPING_CONFIG,
    baseDelay: 8,
    maxGroupSize: 5,
    breathingIntensity: 0.0008,
  },
  
  // Conservative for low-end devices
  conservative: {
    ...DEFAULT_TYPING_CONFIG,
    baseDelay: 12,
    maxGroupSize: 3,
    breathingIntensity: 0.0005,
    microInteractions: false,
    emojiSupport: false,
  },
  
  // Accessibility-focused
  accessible: {
    ...DEFAULT_TYPING_CONFIG,
    baseDelay: 15,
    breathingEffect: false,
    microInteractions: false,
    reduceMotion: true,
    highContrast: true,
    screenReaderSupport: true,
  },
};

// 🚀 Content-aware presets
export const CONTENT_PRESETS = {
  // Fast for conversational text
  conversational: {
    ...DEFAULT_TYPING_CONFIG,
    baseDelay: 6,
    punctuationDelay: 60,
    newlineDelay: 100,
  },
  
  // Slower for technical content
  technical: {
    ...DEFAULT_TYPING_CONFIG,
    baseDelay: 12,
    codeDelay: 20,
    mathDelay: 30,
    breathingIntensity: 0.0006,
  },
  
  // Balanced for mixed content
  mixed: {
    ...DEFAULT_TYPING_CONFIG,
    baseDelay: 8,
    adaptiveSpeed: true,
  },
};

// 🚀 Device-specific optimizations
export const DEVICE_OPTIMIZATIONS = {
  // Mobile devices
  mobile: {
    maxGroupSize: 3,
    breathingIntensity: 0.0005,
    microInteractions: false,
    smoothScrolling: false,
  },
  
  // Tablet devices
  tablet: {
    maxGroupSize: 4,
    breathingIntensity: 0.0007,
    microInteractions: true,
    smoothScrolling: true,
  },
  
  // Desktop devices
  desktop: {
    maxGroupSize: 5,
    breathingIntensity: 0.0008,
    microInteractions: true,
    smoothScrolling: true,
    highRefreshRate: true,
  },
  
  // High-refresh displays
  highRefresh: {
    maxGroupSize: 6,
    breathingIntensity: 0.001,
    microInteractions: true,
    smoothScrolling: true,
    highRefreshRate: true,
    frameRateLimit: 120,
  },
};

// 🚀 Utility functions for configuration management
export class TypingAnimationConfigManager {
  private config: TypingAnimationUserConfig;
  
  constructor(initialConfig?: Partial<TypingAnimationUserConfig>) {
    this.config = { ...DEFAULT_TYPING_CONFIG, ...initialConfig };
  }
  
  // Get current configuration
  getConfig(): TypingAnimationUserConfig {
    return { ...this.config };
  }
  
  // Update configuration
  updateConfig(updates: Partial<TypingAnimationUserConfig>): void {
    this.config = { ...this.config, ...updates };
  }
  
  // Apply performance preset
  applyPreset(presetName: keyof typeof PERFORMANCE_PRESETS): void {
    this.config = { ...this.config, ...PERFORMANCE_PRESETS[presetName] };
  }
  
  // Apply content preset
  applyContentPreset(presetName: keyof typeof CONTENT_PRESETS): void {
    this.config = { ...this.config, ...CONTENT_PRESETS[presetName] };
  }
  
  // Apply device optimizations
  applyDeviceOptimizations(deviceType: keyof typeof DEVICE_OPTIMIZATIONS): void {
    this.config = { ...this.config, ...DEVICE_OPTIMIZATIONS[deviceType] };
  }
  
  // Auto-detect and apply best settings
  autoOptimize(): void {
    // Detect device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(navigator.userAgent);
    
    if (isMobile) {
      this.applyDeviceOptimizations('mobile');
    } else if (isTablet) {
      this.applyDeviceOptimizations('tablet');
    } else {
      this.applyDeviceOptimizations('desktop');
    }
    
    // Detect high refresh rate
    if (window.matchMedia('(min-resolution: 120dpi)').matches) {
      this.applyDeviceOptimizations('highRefresh');
    }
    
    // Apply accessibility settings if needed
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.config.reduceMotion = true;
      this.config.breathingEffect = false;
      this.config.microInteractions = false;
    }
    
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.config.highContrast = true;
    }
  }
  
  // Validate configuration
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (this.config.baseDelay < 1) errors.push('baseDelay must be at least 1ms');
    if (this.config.spaceDelay < 0) errors.push('spaceDelay must be at least 0ms');
    if (this.config.maxGroupSize < 1) errors.push('maxGroupSize must be at least 1');
    if (this.config.breathingIntensity < 0 || this.config.breathingIntensity > 0.01) {
      errors.push('breathingIntensity must be between 0 and 0.01');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  // Export configuration
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }
  
  // Import configuration
  importConfig(configString: string): boolean {
    try {
      const imported = JSON.parse(configString);
      this.config = { ...DEFAULT_TYPING_CONFIG, ...imported };
      return true;
    } catch {
      return false;
    }
  }
}

// 🚀 Default instance
export const typingConfigManager = new TypingAnimationConfigManager();

// 🚀 Auto-optimize on import
if (typeof window !== 'undefined') {
  typingConfigManager.autoOptimize();
}
