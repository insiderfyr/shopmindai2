import React, { memo, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { useChatContext } from '~/Providers';
import { cn } from '~/utils';
import store from '~/store';
import Markdown from './Markdown';
import MarkdownLite from './MarkdownLite';
import { useTypingAnimation } from '~/hooks/useTypingAnimation';
import './TypingAnimation.css';

interface CinematicTypingProps {
  text: string;
  isCreatedByUser: boolean;
  message: any;
  showCursor: boolean;
  className?: string;
}

const CinematicTyping = memo(({
  text,
  isCreatedByUser,
  message,
  showCursor,
  className = '',
}: CinematicTypingProps) => {
  const { isSubmitting, latestMessage } = useChatContext();
  const enableUserMsgMarkdown = useRecoilValue(store.enableUserMsgMarkdown);
  
  const showCursorState = useMemo(() => showCursor && isSubmitting, [showCursor, isSubmitting]);
  const isLatestMessage = useMemo(
    () => message.messageId === latestMessage?.messageId,
    [message.messageId, latestMessage?.messageId],
  );

  // Determine if this message should have cinematic typing
  const shouldAnimate = useMemo(() => {
    return !isCreatedByUser && showCursorState && text.length > 0;
  }, [isCreatedByUser, showCursorState, text.length]);

  // Use the advanced typing animation hook
  const {
    displayText,
    isTyping,
    isComplete,
    phase,
    animationClasses,
    progress,
  } = useTypingAnimation(
    text,
    shouldAnimate,
    false, // isComplete parameter - will be managed by the hook
    {
      baseDelay: 15,
      spaceDelay: 5,
      punctuationDelay: 150,
      newlineDelay: 300,
      codeDelay: 25,
      mathDelay: 40,
      breathingEffect: true,
      smartPausing: true,
    }
  );

  // Determine what text to display
  const finalText = useMemo(() => {
    if (isCreatedByUser) {
      return text; // User messages show immediately
    }
    
    if (shouldAnimate) {
      return displayText; // Animated text during typing
    }
    
    return text; // Complete text when not animating
  }, [isCreatedByUser, shouldAnimate, displayText, text]);

  // Create content based on message type
  const content = useMemo(() => {
    if (!isCreatedByUser) {
      return <Markdown content={finalText} isLatestMessage={isLatestMessage} />;
    } else if (enableUserMsgMarkdown) {
      return <MarkdownLite content={finalText} />;
    } else {
      return <>{finalText}</>;
    }
  }, [isCreatedByUser, enableUserMsgMarkdown, finalText, isLatestMessage]);

  // Determine CSS classes
  const containerClasses = useMemo(() => {
    const baseClasses = [
      'cinematic-typing-container',
      'relative',
      'transition-all',
      'duration-200',
      'ease-out',
    ];

    if (shouldAnimate) {
      baseClasses.push(animationClasses);
    }

    if (isTyping) {
      baseClasses.push('result-streaming');
    }

    if (isSubmitting) {
      baseClasses.push('submitting');
    }

    return cn(baseClasses, className);
  }, [shouldAnimate, animationClasses, isTyping, isSubmitting, className]);

  // Progress indicator for long messages
  const showProgress = useMemo(() => {
    return shouldAnimate && text.length > 200 && progress > 0.1;
  }, [shouldAnimate, text.length, progress]);

  return (
    <div className={containerClasses}>
      {/* Progress indicator */}
      {showProgress && (
        <div 
          className="typing-progress"
          style={{ width: `${progress * 100}%` }}
        />
      )}
      
      {/* Main content */}
      <div
        className={cn(
          'markdown prose message-content dark:prose-invert light w-full break-words',
          isCreatedByUser && !enableUserMsgMarkdown && 'whitespace-pre-wrap',
          isCreatedByUser ? 'dark:text-gray-20' : 'dark:text-gray-100',
          'transition-all duration-150 ease-out',
        )}
      >
        {content}
      </div>

      {/* Micro-interactions overlay */}
      {shouldAnimate && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Hover effect area */}
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200" />
        </div>
      )}
    </div>
  );
});

CinematicTyping.displayName = 'CinematicTyping';

export default CinematicTyping;

