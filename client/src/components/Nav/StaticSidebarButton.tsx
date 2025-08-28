import React, { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys, Constants } from 'librechat-data-provider';
import type { TMessage } from 'librechat-data-provider';
import { TooltipAnchor } from '~/components/ui/Tooltip';
import { useLocalize, useNewConvo } from '~/hooks';
import { useNavigate } from 'react-router-dom';
import store from '~/store';

interface StaticSidebarButtonProps {
  type: 'sidebar' | 'newchat';
  setNavVisible?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function StaticSidebarButton({ type, setNavVisible }: StaticSidebarButtonProps) {
  const localize = useLocalize();
  const queryClient = useQueryClient();
  const { newConversation: newConvo } = useNewConvo(0);
  const navigate = useNavigate();
  const { conversation } = store.useCreateConversationAtom(0);

  const handleNewChat: React.MouseEventHandler<SVGSVGElement> = useCallback(
    (e) => {
      if (e.button === 0 && (e.ctrlKey || e.metaKey)) {
        window.open('/c/new', '_blank');
        return;
      }
      queryClient.setQueryData<TMessage[]>(
        [QueryKeys.messages, conversation?.conversationId ?? Constants.NEW_CONVO],
        [],
      );
      queryClient.invalidateQueries([QueryKeys.messages]);
      newConvo();
      navigate('/c/new', { state: { focusChat: true } });
    },
    [queryClient, conversation, newConvo, navigate],
  );

  const handleSidebarToggle: React.MouseEventHandler<SVGSVGElement> = useCallback(() => {
    if (setNavVisible) {
      setNavVisible((prev) => {
        localStorage.setItem('navVisible', JSON.stringify(!prev));
        return !prev;
      });
    }
  }, [setNavVisible]);

  const getIcon = () => {
    if (type === 'newchat') {
      return (
        <svg
          onClick={handleNewChat}
          className="h-6 w-6 cursor-pointer text-gray-700 transition-colors duration-300 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-gray-100"
          fill="currentColor"
          viewBox="0 0 24 24"
          data-testid="static-new-chat-button"
          aria-label={localize('com_ui_new_chat')}
          role="button"
          tabIndex={0}
        >
          <path
            fillRule="evenodd"
            d="M6.416 4.767a2.65 2.65 0 0 0-2.65 2.65v8.832a2.65 2.65 0 0 0 2.65 2.65h1.461V4.767h-1.46Zm0-1.767A4.416 4.416 0 0 0 2 7.416v8.833a4.416 4.416 0 0 0 4.416 4.417h11.168A4.416 4.416 0 0 0 22 16.248V7.416A4.416 4.416 0 0 0 17.584 3zm3.228 1.767v14.132h7.94a2.65 2.65 0 0 0 2.65-2.65V7.416a2.65 2.65 0 0 0-2.65-2.65h-7.94Z"
            clipRule="evenodd"
          />
        </svg>
      );
    }

    return (
      <svg
        onClick={handleSidebarToggle}
        className="h-6 w-6 cursor-pointer text-gray-700 transition-colors duration-300 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-gray-100"
        fill="currentColor"
        viewBox="0 0 16 16"
        data-testid="static-sidebar-button"
        aria-label={localize('com_nav_open_sidebar')}
        role="button"
        tabIndex={0}
      >
        <path
          fill="currentColor"
          d="M7.5 4a.5.5 0 0 1 .5.5V7h2.5a.5.5 0 0 1 0 1H8v2.5a.5.5 0 0 1-1 0V8H4.5a.5.5 0 0 1 0-1H7V4.5a.5.5 0 0 1 .5-.5"
        />
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M0 6.4c0-2.24 0-3.36.436-4.22A4.03 4.03 0 0 1 2.186.43c.856-.436 1.98-.436 4.22-.436h2.2c2.24 0 3.36 0 4.22.436c.753.383 1.36.995 1.75 1.75c.436.856.436 1.98.436 4.22v2.2c0 2.24 0 3.36-.436 4.22a4.03 4.03 0 0 1-1.75 1.75c-.856.436-1.98.436-4.22.436h-2.2c-2.24 0-3.36 0-4.22-.436a4.03 4.03 0 0 1-1.75-1.75C0 11.964 0 10.84 0 8.6zM6.4 1h2.2c1.14 0 1.93 0 2.55.051c.605.05.953.142 1.22.276a3.02 3.02 0 0 1 1.31 1.31c.134.263.226.611.276 1.22c.05.617.051 1.41.051 2.55v2.2c0 1.14 0 1.93-.051 2.55c-.05.605-.142.953-.276 1.22a3 3 0 0 1-1.31 1.31c-.263.134-.611.226-1.22.276c-.617.05-1.41.051-2.55.051H6.4c-1.14 0-1.93 0-2.55-.05c-.605-.05-.953-.143-1.22-.277a3 3 0 0 1-1.31-1.31c-.134-.263-.226-.61-.276-1.22c-.05-.617-.051-1.41-.051-2.55v-2.2c0-1.14 0-1.93.051-2.55c.05-.605.142-.953.276-1.22a3.02 3.02 0 0 1 1.31-1.31c.263-.134.611-.226 1.22-.276C4.467 1.001 5.26 1 6.4 1"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  const getTooltipText = () => {
    return type === 'newchat' ? localize('com_ui_new_chat') : localize('com_nav_open_sidebar');
  };

  return (
    <TooltipAnchor
      description={getTooltipText()}
      side="bottom"
      render={
        <div className="group relative rounded-lg p-2 transition-all duration-300 ease-out hover:bg-white/60 hover:shadow-lg dark:hover:bg-white/10">
          {getIcon()}
        </div>
      }
    />
  );
}
