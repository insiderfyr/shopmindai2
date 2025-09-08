import { memo, useMemo } from 'react';
import { ContentTypes } from 'librechat-data-provider';

type ReasoningProps = {
  reasoning: string;
};

const Reasoning = memo(({ reasoning }: ReasoningProps) => {
  const { isExpanded, nextType } = useMessageContext();
  const reasoningText = useMemo(() => {
    return reasoning
      .replace(/^<think>\s*/, '')
      .replace(/\s*<\/think>$/, '')
      .trim();
  }, [reasoning]);

  if (!reasoningText) {
    return null;
  }

  return (
    <div
      className={cn(
        'grid transition-all duration-300 ease-out',
        nextType !== ContentTypes.THINK && isExpanded && 'mb-8',
      )}
      style={{
        gridTemplateRows: isExpanded ? '1fr' : '0fr',
      }}
    >
      <div className="overflow-hidden">
        <ThinkingContent isPart={true}>{reasoningText}</ThinkingContent>
      </div>
    </div>
  );
});

export default Reasoning;
