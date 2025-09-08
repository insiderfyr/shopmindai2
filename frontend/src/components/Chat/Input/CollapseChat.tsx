import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TooltipAnchor } from '~/components/ui';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

const CollapseChat = ({
  isScrollable,
  isCollapsed,
  setIsCollapsed,
}: {
  isScrollable: boolean;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const localize = useLocalize();
  if (!isScrollable) {
    return null;
  }

  const description = isCollapsed
    ? localize('com_ui_expand_chat')
    : localize('com_ui_collapse_chat');

  return (
    <div className="relative ml-auto items-end justify-end">
      <TooltipAnchor
        description={description}
        render={
          <button
            aria-label={description}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsCollapsed((prev) => !prev);
            }}
            className={cn(
              // Ghost button design - invisible until hover
              'z-10 size-4 rounded-full transition-all duration-200 ease-in-out',
              'bg-transparent border-transparent',
              'opacity-30 hover:opacity-100',
              'hover:bg-gray-100/50 hover:scale-110',
              'active:scale-95',
              'text-gray-400 hover:text-gray-600',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:ring-opacity-50',
              'dark:hover:bg-gray-700/50 dark:text-gray-500 dark:hover:text-gray-300',
            )}
          >
            {isCollapsed ? (
              <ChevronUp className="h-full w-full" />
            ) : (
              <ChevronDown className="h-full w-full" />
            )}
          </button>
        }
      />
    </div>
  );
};

export default CollapseChat;
