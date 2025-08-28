import React from 'react';
import type { TMessage } from 'librechat-data-provider';
import SiblingSwitch from '../SiblingSwitch';
import HoverButtons from '../HoverButtons';

// Helper function to create SubRow content - extracted to reduce duplication
export const createSubRowContent = (
  shouldShowSubRow: boolean,
  siblingIdx: number | undefined,
  siblingCount: number | undefined,
  setSiblingIdx: ((value: number) => void) | null | undefined,
  index: number,
  edit: boolean,
  msg: TMessage,
  enterEdit: (cancel?: boolean) => void,
  isSubmitting: boolean,
  conversation: any,
  handleRegenerateMessage: () => void,
  copyToClipboard: (setIsCopied: React.Dispatch<React.SetStateAction<boolean>>) => void,
  handleContinue: (e: React.MouseEvent<HTMLButtonElement>) => void,
  latestMessage: TMessage | null,
  handleFeedback: ({ feedback }: { feedback: any }) => void,
  isLast: boolean,
) => {
  if (!shouldShowSubRow) return null;

  return (
    <>
      <SiblingSwitch
        siblingIdx={siblingIdx}
        siblingCount={siblingCount}
        setSiblingIdx={setSiblingIdx}
      />
      <HoverButtons
        index={index}
        isEditing={edit}
        message={msg}
        enterEdit={enterEdit}
        isSubmitting={isSubmitting}
        conversation={conversation ?? null}
        regenerate={handleRegenerateMessage}
        copyToClipboard={copyToClipboard}
        handleContinue={handleContinue}
        latestMessage={latestMessage}
        handleFeedback={handleFeedback}
        isLast={isLast}
      />
    </>
  );
};

// Helper function to determine if SubRow should be shown
export const shouldShowSubRow = (
  isLast: boolean,
  isSubmitting: boolean,
  isSubmittingFamily?: boolean,
  hasChildren?: boolean,
) => {
  if (isSubmittingFamily !== undefined) {
    return !((isSubmittingFamily || isSubmitting) && !hasChildren);
  }
  return !(isLast && isSubmitting);
};

// Helper function to create base classes for message components
export const createBaseClasses = (maximizeChatSpace: boolean) => ({
  common: 'group mx-auto flex flex-1 gap-3 transition-all duration-300 transform-gpu ',
  chat: maximizeChatSpace
    ? 'w-full max-w-full md:px-5 lg:px-1 xl:px-5'
    : 'md:max-w-[47rem] xl:max-w-[55rem]',
});

// Helper function to create conditional classes for card rendering
export const createConditionalClasses = (isLatestCard: boolean, showCardRender: boolean) => ({
  latestCard: isLatestCard ? 'bg-surface-secondary' : '',
  cardRender: showCardRender ? 'cursor-pointer transition-colors duration-300' : '',
  focus: 'focus:outline-none focus:ring-2 focus:ring-border-xheavy',
});
