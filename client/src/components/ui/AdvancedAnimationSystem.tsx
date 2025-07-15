import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useSprings, animated, useTrail, useSpring, easings } from '@react-spring/web';
import { cn } from '~/utils';

// 🚀 BILLION DOLLAR ANIMATION PSYCHOLOGY
const ANIMATION_PSYCHOLOGY = {
  // Trust-building entrance animations
  entrance: {
    logo: {
      from: { scale: 0, rotate: -180, opacity: 0 },
      to: { scale: 1, rotate: 0, opacity: 1 },
      config: { tension: 300, friction: 20, mass: 1 }
    },
    greeting: {
      from: { y: 100, opacity: 0, scale: 0.8 },
      to: { y: 0, opacity: 1, scale: 1 },
      config: { tension: 400, friction: 25, mass: 0.8 }
    },
    content: {
      from: { y: 50, opacity: 0 },
      to: { y: 0, opacity: 1 },
      config: { tension: 350, friction: 30 }
    }
  },
  
  // Engagement-driving micro-interactions
  micro: {
    hover: {
      scale: 1.05,
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    },
    tap: {
      scale: 0.95,
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    },
    focus: {
      scale: 1.02,
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)',
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    }
  },
  
  // Attention-grabbing particle system
  particles: {
    count: 12,
    colors: ['#3b82f6', '#6366f1', '#8b5cf6', '#06b6d4'],
    sizes: [2, 3, 4],
    speeds: [20, 30, 40]
  }
};

// 🎯 ADVANCED ANIMATION COMPONENTS

// 1. AI-Powered Particle Background
export const AIParticleBackground: React.FC<{ className?: string }> = ({ className }) => {
  const particles = useTrail(ANIMATION_PSYCHOLOGY.particles.count, {
    from: { scale: 0, opacity: 0, x: 0, y: 0 },
    to: { scale: 1, opacity: 0.3, x: 100, y: -100 },
    config: { tension: 500, friction: 30 },
    delay: 800
  });

  return (
    <div className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}>
      {particles.map((props, index) => {
        const color = ANIMATION_PSYCHOLOGY.particles.colors[index % ANIMATION_PSYCHOLOGY.particles.colors.length];
        const size = ANIMATION_PSYCHOLOGY.particles.sizes[index % ANIMATION_PSYCHOLOGY.particles.sizes.length];
        
        return (
          <animated.div
            key={index}
            className="absolute rounded-full blur-sm"
            style={{
              ...props,
              width: size,
              height: size,
              backgroundColor: color,
              left: `${20 + index * 8}%`,
              top: `${30 + index * 6}%`,
              filter: 'blur(1px)',
              animation: `float ${3 + index % 3}s ease-in-out infinite`
            }}
          />
        );
      })}
    </div>
  );
};

// 2. Psychology-Driven Entrance Animation
export const PsychologyEntrance: React.FC<{
  children: React.ReactNode;
  type: 'logo' | 'greeting' | 'content';
  delay?: number;
  className?: string;
}> = ({ children, type, delay = 0, className }) => {
  const animation = useSpring({
    from: ANIMATION_PSYCHOLOGY.entrance[type].from,
    to: ANIMATION_PSYCHOLOGY.entrance[type].to,
    config: ANIMATION_PSYCHOLOGY.entrance[type].config,
    delay
  });

  return (
    <animated.div style={animation as any} className={className}>
      {children}
    </animated.div>
  );
};

// 3. Billion Dollar Micro-Interaction Button
export const MicroInteractionButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}> = ({ children, onClick, className, variant = 'primary', size = 'md' }) => {
  const scale = useMotionValue(1);
  const rotate = useMotionValue(0);
  const shadow = useTransform(scale, [1, 1.05], ['0px 4px 12px rgba(0,0,0,0.1)', '0px 8px 24px rgba(0,0,0,0.15)']);

  const handleHoverStart = () => {
    scale.set(1.05);
    rotate.set(2);
  };

  const handleHoverEnd = () => {
    scale.set(1);
    rotate.set(0);
  };

  const handleTapStart = () => {
    scale.set(0.95);
  };

  const handleTapEnd = () => {
    scale.set(1.05);
  };

  const baseClasses = cn(
    'relative overflow-hidden rounded-lg font-medium transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    'transform-gpu will-change-transform',
    {
      'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
      'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700': variant === 'secondary',
      'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800': variant === 'ghost',
      'px-3 py-1.5 text-sm': size === 'sm',
      'px-4 py-2 text-base': size === 'md',
      'px-6 py-3 text-lg': size === 'lg'
    },
    className
  );

  return (
    <motion.button
      className={baseClasses}
      style={{ scale, rotate, boxShadow: shadow }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onTapStart={handleTapStart}
      onClick={onClick}
      whileFocus={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="relative z-10">{children}</div>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
    </motion.button>
  );
};

// 4. AI-Powered Text Animation with Psychology
export const AITextAnimation: React.FC<{
  text: string;
  className?: string;
  delay?: number;
  speed?: 'slow' | 'normal' | 'fast';
  effect?: 'typewriter' | 'fade' | 'slide' | 'bounce';
}> = ({ text, className, delay = 0, speed = 'normal', effect = 'fade' }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const speedConfig = {
    slow: 100,
    normal: 50,
    fast: 25
  };

  useEffect(() => {
    if (effect === 'typewriter') {
      const timer = setTimeout(() => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        }
      }, speedConfig[speed]);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed, effect, speedConfig]);

  const animationVariants = {
    typewriter: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    },
    fade: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    },
    slide: {
      hidden: { opacity: 0, x: -50 },
      visible: { opacity: 1, x: 0 }
    },
    bounce: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 }
    }
  };

  return (
    <motion.div
      className={cn('overflow-hidden', className)}
      initial="hidden"
      animate="visible"
      variants={animationVariants[effect]}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {effect === 'typewriter' ? (
        <span className="inline-block">
          {displayText}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="ml-1"
          >
            |
          </motion.span>
        </span>
      ) : (
        <span>{text}</span>
      )}
    </motion.div>
  );
};

// 5. Silicon Valley Loading Animation
export const SiliconValleyLoader: React.FC<{ className?: string }> = ({ className }) => {
  const dots = useTrail(3, {
    from: { scale: 0, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: { tension: 500, friction: 30 },
    loop: true,
    delay: 200
  });

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      {dots.map((props, index) => (
        <animated.div
          key={index}
          className="w-3 h-3 bg-blue-600 rounded-full"
          style={{
            ...props,
            animationDelay: `${index * 0.2}s`
          }}
        />
      ))}
    </div>
  );
};

// 6. Advanced Hover Card with AI Psychology
export const AIHoverCard: React.FC<{
  trigger: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}> = ({ trigger, content, className, side = 'top' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <motion.div
        onHoverStart={() => setIsOpen(true)}
        onHoverEnd={() => setIsOpen(false)}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {trigger}
      </motion.div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={cn(
              'absolute z-50 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700',
              'min-w-[200px] max-w-[300px]',
              {
                'bottom-full left-1/2 transform -translate-x-1/2 mb-2': side === 'top',
                'top-full left-1/2 transform -translate-x-1/2 mt-2': side === 'bottom',
                'right-full top-1/2 transform -translate-y-1/2 mr-2': side === 'left',
                'left-full top-1/2 transform -translate-y-1/2 ml-2': side === 'right'
              },
              className
            )}
            initial={{ opacity: 0, scale: 0.8, y: side === 'top' ? 10 : side === 'bottom' ? -10 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: side === 'top' ? 10 : side === 'bottom' ? -10 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 7. Performance-Optimized Scroll Animation
export const ScrollAnimation: React.FC<{
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  animation?: 'fade' | 'slide' | 'scale' | 'rotate';
}> = ({ children, className, threshold = 0.1, rootMargin = '0px', animation = 'fade' }) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const animationVariants = {
    fade: {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0 }
    },
    slide: {
      hidden: { opacity: 0, x: -100 },
      visible: { opacity: 1, x: 0 }
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 }
    },
    rotate: {
      hidden: { opacity: 0, rotate: -10, scale: 0.8 },
      visible: { opacity: 1, rotate: 0, scale: 1 }
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={animationVariants[animation]}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

// 8. AI-Powered Gradient Text
export const AIGradientText: React.FC<{
  children: React.ReactNode;
  className?: string;
  gradient?: 'blue' | 'purple' | 'rainbow' | 'custom';
  animate?: boolean;
}> = ({ children, className, gradient = 'blue', animate = true }) => {
  const gradientClasses = {
    blue: 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600',
    purple: 'bg-gradient-to-r from-purple-600 via-pink-500 to-red-600',
    rainbow: 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500',
    custom: 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600'
  };

  return (
    <span
      className={cn(
        'bg-clip-text text-transparent',
        gradientClasses[gradient],
        animate && 'animate-gradient-x',
        className
      )}
    >
      {children}
    </span>
  );
};

// 9. Billion Dollar Notification Animation
export const BillionDollarNotification: React.FC<{
  children: React.ReactNode;
  isVisible: boolean;
  onClose?: () => void;
  type?: 'success' | 'error' | 'warning' | 'info';
  className?: string;
}> = ({ children, isVisible, onClose, type = 'info', className }) => {
  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            'fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg max-w-sm',
            typeStyles[type],
            className
          )}
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          layout
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">{children}</div>
            {onClose && (
              <motion.button
                onClick={onClose}
                className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 10. Performance-Optimized Animation Hook
export const useOptimizedAnimation = (options: {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (options.triggerOnce) {
            observer.disconnect();
          }
        } else if (!options.triggerOnce) {
          setIsInView(false);
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin, options.triggerOnce]);

  return { ref, isInView };
};

// Export all components
export {
  ANIMATION_PSYCHOLOGY
}; 