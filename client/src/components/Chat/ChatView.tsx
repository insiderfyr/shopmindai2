import { memo, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Constants } from 'librechat-data-provider';
import type { TMessage } from 'librechat-data-provider';
import type { ChatFormValues } from '~/common';
import { ChatContext, AddedChatContext, useFileMapContext, ChatFormProvider } from '~/Providers';
import { useChatHelpers, useAddedResponse, useSSE } from '~/hooks';
import { useResponsive, useResponsiveSpacing, useResponsiveSizing } from '~/hooks/useResponsive';
import ConversationStarters from './Input/ConversationStarters';
import { useGetMessagesByConvoId } from '~/data-provider';
import MessagesView from './Messages/MessagesView';
import { Spinner } from '~/components/svg';
import Presentation from './Presentation';
import { buildTree, cn } from '~/utils';
import ChatForm from './Input/ChatForm';
import Landing from './Landing';
import Header from './Header';
import store from '~/store';
import './ChatView.css';



// Adaptive layout configurations
const getLayoutConfig = (deviceType: string, isLandingPage: boolean) => {
  const configs = {
    mobile: {
      container: 'px-2 py-1',
      content: 'px-1',
      formContainer: 'w-full px-2',
      scale: 'scale-100',
      maxWidth: 'max-w-full',
      spacing: 'space-y-2',
      headerHeight: 'h-12',
      formSpacing: 'mb-4'
    },
    tablet: {
      container: 'px-4 py-2',
      content: 'px-2',
      formContainer: 'w-11/12 px-3',
      scale: 'scale-105',
      maxWidth: 'max-w-3xl',
      spacing: 'space-y-3',
      headerHeight: 'h-14',
      formSpacing: 'mb-6'
    },
    desktop: {
      container: 'px-6 py-3',
      content: 'px-4',
      formContainer: 'w-4/5 px-4',
      scale: 'scale-110',
      maxWidth: 'max-w-4xl',
      spacing: 'space-y-4',
      headerHeight: 'h-16',
      formSpacing: 'mb-8'
    }
  };

  return configs[deviceType as keyof typeof configs] || configs.desktop;
};

function LoadingSpinner({ deviceType }: { deviceType: string }) {
  const config = getLayoutConfig(deviceType, false);
  
  return (
    <div className={cn(
      "relative flex-1 overflow-hidden overflow-y-auto",
      config.content
    )}>
      <div className="relative flex h-full items-center justify-center">
        <Spinner className={cn(
          "text-text-primary",
          deviceType === 'mobile' ? 'w-6 h-6' : 
          deviceType === 'tablet' ? 'w-8 h-8' : 'w-10 h-10'
        )} />
      </div>
    </div>
  );
}

function ChatView({ index = 0 }: { index?: number }) {
  const { conversationId } = useParams();
  const { deviceType, screenSize } = useResponsive();
  const rootSubmission = useRecoilValue(store.submissionByIndex(index));
  const addedSubmission = useRecoilValue(store.submissionByIndex(index + 1));
  const centerFormOnLanding = useRecoilValue(store.centerFormOnLanding);

  const fileMap = useFileMapContext();

  const { data: messagesTree = null, isLoading } = useGetMessagesByConvoId(conversationId ?? '', {
    select: useCallback(
      (data: TMessage[]) => {
        const dataTree = buildTree({ messages: data, fileMap });
        return dataTree?.length === 0 ? null : (dataTree ?? null);
      },
      [fileMap],
    ),
    enabled: !!fileMap,
  });

  const chatHelpers = useChatHelpers(index, conversationId);
  const addedChatHelpers = useAddedResponse({ rootIndex: index });

  useSSE(rootSubmission, chatHelpers, false);
  useSSE(addedSubmission, addedChatHelpers, true);

  const methods = useForm<ChatFormValues>({
    defaultValues: { text: '' },
  });

  let content: JSX.Element | null | undefined;
  const isLandingPage =
    (!messagesTree || messagesTree.length === 0) &&
    (conversationId === Constants.NEW_CONVO || !conversationId);
  const isNavigating = (!messagesTree || messagesTree.length === 0) && conversationId != null;

  if (isLoading && conversationId !== Constants.NEW_CONVO) {
    content = <LoadingSpinner deviceType={deviceType} />;
  } else if ((isLoading || isNavigating) && !isLandingPage) {
    content = <LoadingSpinner deviceType={deviceType} />;
  } else if (!isLandingPage) {
    content = <MessagesView messagesTree={messagesTree} />;
  } else {
    content = <Landing centerFormOnLanding={centerFormOnLanding} />;
  }

  const layoutConfig = getLayoutConfig(deviceType, isLandingPage);

  return (
    <ChatFormProvider {...methods}>
      <ChatContext.Provider value={chatHelpers}>
        <AddedChatContext.Provider value={addedChatHelpers}>
          <Presentation>
            <div 
              className={cn(
                "flex h-full w-full flex-col border border-gray-200/30 dark:border-gray-700/30",
                "transition-all duration-300 ease-in-out",
                layoutConfig.container
              )}
              style={{
                // Dynamic height adjustment for mobile devices
                height: deviceType === 'mobile' && screenSize.height < 600 ? 'calc(100vh - 60px)' : '100%'
              }}
            >
              {!isLoading && <Header />}
              
              <div
                className={cn(
                  'flex flex-col',
                  layoutConfig.spacing,
                  isLandingPage
                    ? 'flex-1 items-center justify-center bg-blue-50 dark:bg-[#182533]'
                    : 'h-full overflow-y-auto',
                  // Mobile-specific optimizations
                  deviceType === 'mobile' && 'min-h-0'
                )}
              >
                {content}
                
                <div
                  className={cn(
                    layoutConfig.formContainer,
                    layoutConfig.scale,
                    layoutConfig.maxWidth,
                    'transition-all duration-300 ease-in-out',
                    // Responsive form positioning
                    deviceType === 'mobile' ? 'fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t' :
                    deviceType === 'tablet' ? 'mx-auto' : 'mx-auto',
                    // Adaptive spacing
                    layoutConfig.formSpacing
                  )}
                >
                  <ChatForm index={index} />
                  {isLandingPage ? <ConversationStarters /> : null}
                </div>
                
                {/* Mobile bottom spacing to prevent form overlap */}
                {deviceType === 'mobile' && (
                  <div className="h-20" />
                )}
              </div>
            </div>
          </Presentation>
        </AddedChatContext.Provider>
      </ChatContext.Provider>
    </ChatFormProvider>
  );
}

export default memo(ChatView);
