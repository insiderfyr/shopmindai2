import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface TypingAnimationConfig {
  baseDelay: number;
  spaceDelay: number;
  punctuationDelay: number;
  newlineDelay: number;
  codeDelay: number;
  mathDelay: number;
  breathingEffect: boolean;
  smartPausing: boolean;
}

interface TypingState {
  displayText: string;
  currentIndex: number;
  isTyping: boolean;
  isComplete: boolean;
  phase: 'pre-animation' | 'entrance' | 'typing' | 'completion' | 'settled';
}

const DEFAULT_CONFIG: TypingAnimationConfig = {
  baseDelay: 15,
  spaceDelay: 5,
  punctuationDelay: 150,
  newlineDelay: 300,
  codeDelay: 25,
  mathDelay: 40,
  breathingEffect: true,
  smartPausing: true,
};

export const useTypingAnimation = (
  text: string,
  isStreaming: boolean,
  isComplete: boolean,
  config: Partial<TypingAnimationConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [state, setState] = useState<TypingState>({
    displayText: '',
    currentIndex: 0,
    isTyping: false,
    isComplete: false,
    phase: 'pre-animation',
  });

  const animationRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);
  const userScrollingRef = useRef<boolean>(false);
  const windowFocusedRef = useRef<boolean>(true);

  // Smart adaptive delay calculation
  const calculateDelay = useCallback((char: string, context: string, index: number): number => {
    if (isPausedRef.current) return 1000; // Pause when user is not focused
    
    // Base delays
    if (char === ' ') return finalConfig.spaceDelay;
    if (/[.!?]/.test(char)) return finalConfig.punctuationDelay;
    if (char === '\n') return finalConfig.newlineDelay;
    if (/[,;:]/.test(char)) return 80;
    
    // Contextual delays
    if (context.includes('```') || context.includes('`')) return finalConfig.codeDelay;
    if (context.includes('$') || context.includes('\\')) return finalConfig.mathDelay;
    
    // Natural variation
    const baseDelay = finalConfig.baseDelay;
    const variation = Math.random() * 10;
    
    // Slow down if user is scrolling
    if (userScrollingRef.current) return baseDelay + variation + 50;
    
    // Slow down if window is not focused
    if (!windowFocusedRef.current) return baseDelay + variation + 100;
    
    return baseDelay + variation;
  }, [finalConfig]);

  // Smart character grouping
  const shouldGroup = useCallback((text: string, index: number): boolean => {
    const nextChars = text.slice(index, index + 3);
    return nextChars.length <= 3 && !/[.!?\n]/.test(nextChars);
  }, []);

  // Performance-optimized animation frame
  const animateNextCharacter = useCallback(() => {
    if (!isStreaming || state.currentIndex >= text.length) {
      setState(prev => ({ ...prev, isTyping: false, isComplete: true, phase: 'completion' }));
      return;
    }

    const now = performance.now();
    if (now - lastUpdateRef.current < 16) { // 60fps limit
      animationRef.current = requestAnimationFrame(animateNextCharacter);
      return;
    }

    lastUpdateRef.current = now;

    setState(prev => {
      const nextIndex = prev.currentIndex + 1;
      const nextText = text.slice(0, nextIndex);
      
      return {
        ...prev,
        displayText: nextText,
        currentIndex: nextIndex,
        isTyping: nextIndex < text.length,
        phase: nextIndex < text.length ? 'typing' : 'completion',
      };
    });

    // Calculate next delay
    const nextChar = text[state.currentIndex + 1];
    const context = text.slice(0, state.currentIndex + 1);
    const delay = calculateDelay(nextChar, context, state.currentIndex + 1);

    // Group characters for fluidity
    const shouldGroupNext = shouldGroup(text, state.currentIndex + 1);
    const groupDelay = shouldGroupNext ? delay * 0.5 : delay;

    animationRef.current = setTimeout(() => {
      requestAnimationFrame(animateNextCharacter);
    }, groupDelay);
  }, [text, isStreaming, state.currentIndex, calculateDelay, shouldGroup]);

  // Smart pausing detection
  useEffect(() => {
    const handleScroll = () => {
      userScrollingRef.current = true;
      setTimeout(() => {
        userScrollingRef.current = false;
      }, 200);
    };

    const handleVisibilityChange = () => {
      windowFocusedRef.current = !document.hidden;
    };

    const handleFocus = () => {
      windowFocusedRef.current = true;
    };

    const handleBlur = () => {
      windowFocusedRef.current = false;
    };

    if (finalConfig.smartPausing) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
      };
    }
  }, [finalConfig.smartPausing]);

  // Animation lifecycle management
  useEffect(() => {
    if (isStreaming && text.length > 0 && state.phase === 'pre-animation') {
      setState(prev => ({ ...prev, phase: 'entrance' }));
      
      // Start entrance animation
      setTimeout(() => {
        setState(prev => ({ ...prev, phase: 'typing' }));
        requestAnimationFrame(animateNextCharacter);
      }, 200);
    } else if (!isStreaming && text.length > 0) {
      // If not streaming, show full text immediately
      setState(prev => ({
        ...prev,
        displayText: text,
        isTyping: false,
        isComplete: true,
        phase: 'settled',
      }));
    }
  }, [isStreaming, text, state.phase, animateNextCharacter]);

  // Reset animation when text changes
  useEffect(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      cancelAnimationFrame(animationRef.current);
    }

    setState({
      displayText: '',
      currentIndex: 0,
      isTyping: false,
      isComplete: false,
      phase: 'pre-animation',
    });
  }, [text, isStreaming]);

  // Handle completion
  useEffect(() => {
    if (state.isComplete && state.phase === 'completion') {
      setTimeout(() => {
        setState(prev => ({ ...prev, phase: 'settled' }));
      }, 1000);
    }
  }, [state.isComplete, state.phase]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Computed values for CSS classes
  const animationClasses = useMemo(() => {
    const classes = ['typing-animation'];
    
    switch (state.phase) {
      case 'pre-animation':
        classes.push('pre-animation');
        break;
      case 'entrance':
        classes.push('entrance-animation');
        break;
      case 'typing':
        classes.push('typing-active');
        if (finalConfig.breathingEffect) {
          classes.push('breathing-effect');
        }
        break;
      case 'completion':
        classes.push('completion-animation');
        break;
      case 'settled':
        classes.push('settled');
        break;
    }

    return classes.join(' ');
  }, [state.phase, finalConfig.breathingEffect]);

  return {
    displayText: state.displayText,
    isTyping: state.isTyping,
    isComplete: state.isComplete,
    phase: state.phase,
    animationClasses,
    progress: text.length > 0 ? state.currentIndex / text.length : 0,
  };
};

