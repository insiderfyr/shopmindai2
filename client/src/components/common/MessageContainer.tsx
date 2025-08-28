import React, { useMemo } from 'react';
import { cn } from '~/utils';

interface MessageContainerProps {
  isCreatedByUser: boolean;
  children: React.ReactNode;
  subRowContent?: React.ReactNode;
  className?: string;
  showSubRow?: boolean;
  isSubmitting?: boolean;
  hasActions?: boolean;
  isCard?: boolean;
}

// CSS constants for reusability
const MESSAGE_STYLES = {
  container: {
    user: 'flex flex-col gap-2 w-full',
    agent: 'flex flex-col gap-1',
  },
  bubble: {
    user: 'relative flex flex-col ml-auto user-turn',
    agent: 'relative flex flex-col agent-turn',
  },
  subRow: {
    user: 'opacity-0 group-hover:opacity-100 transition-opacity duration-200 justify-end',
    agent: 'justify-start',
  },
} as const;

const MessageContainer = React.memo(({
  isCreatedByUser,
  children,
  subRowContent,
  className = '',
  showSubRow = true,
  isSubmitting = false,
  hasActions = true,
  isCard = false,
}: MessageContainerProps) => {
  const containerClasses = useMemo(() => {
    return cn(
      isCreatedByUser ? MESSAGE_STYLES.container.user : MESSAGE_STYLES.container.agent,
      className
    );
  }, [isCreatedByUser, className]);

  const bubbleClasses = useMemo(() => {
    return cn(MESSAGE_STYLES.bubble[isCreatedByUser ? 'user' : 'agent']);
  }, [isCreatedByUser]);

  const subRowClasses = useMemo(() => {
    return cn(
      'mt-1 flex gap-3 empty:hidden lg:flex text-xs',
      MESSAGE_STYLES.subRow[isCreatedByUser ? 'user' : 'agent']
    );
  }, [isCreatedByUser]);

  // Don't show SubRow if explicitly disabled or if submitting
  const shouldShowSubRow = showSubRow && hasActions && !isSubmitting && subRowContent;

  return (
    <div className={containerClasses}>
      <div className={bubbleClasses}>
        {children}
      </div>
      
      {shouldShowSubRow && (
        <div className={subRowClasses}>
          {subRowContent}
        </div>
      )}
    </div>
  );
});

MessageContainer.displayName = 'MessageContainer';

export default MessageContainer;
