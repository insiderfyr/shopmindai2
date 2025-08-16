import { useState } from 'react';
import { useLocalize } from '~/hooks';
import { useChatContext } from '~/Providers';
import { useGetStartupConfig } from '~/data-provider';
import { useHasAccess } from '~/hooks';
import { PermissionTypes, Permissions } from 'librechat-data-provider';
import { isAssistantsEndpoint } from 'librechat-data-provider';
import { Button } from '~/components/ui';
import { Settings, Plug, Plus } from 'lucide-react';
import { PluginStoreDialog } from '~/components/Plugins';

export default function HeaderOptions({
  interfaceConfig,
}: {
  interfaceConfig?: any;
}) {
  const localize = useLocalize();
  const { conversation } = useChatContext();
  const { data: startupConfig } = useGetStartupConfig();
  const [showPluginStoreDialog, setShowPluginStoreDialog] = useState(false);
  const [showMentionPopover, setShowMentionPopover] = useState(false);

  const hasAccessToPlugins = useHasAccess({
    permissionType: PermissionTypes.PLUGINS,
    permission: Permissions.USE,
  });

  const hasAccessToPrompts = useHasAccess({
    permissionType: PermissionTypes.PROMPTS,
    permission: Permissions.USE,
  });

  const endpoint = conversation?.endpoint;
  const paramEndpoint = isAssistantsEndpoint(endpoint);

  if (!conversation) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-2">
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 rounded-lg border border-border-light bg-surface-secondary p-1 hover:bg-surface-tertiary"
          aria-label={localize('com_ui_settings')}
        >
          <Settings className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          {hasAccessToPlugins && (
            <Button
              type="button"
              className="h-auto w-[150px] justify-start rounded-md border border-gray-300/50 bg-transparent px-2 py-1 text-xs font-normal text-black hover:bg-gray-100 hover:text-black focus-visible:ring-1 focus-visible:ring-ring-primary dark:border-gray-600 dark:bg-transparent dark:text-white dark:hover:bg-gray-600 dark:focus-visible:ring-white"
              onClick={() => setShowPluginStoreDialog(true)}
            >
              <Plug className="mr-1 w-[14px]" />
              {localize('com_ui_plugins')}
            </Button>
          )}
          {hasAccessToPrompts && (
            <Button
              type="button"
              className="h-auto w-[150px] justify-start rounded-md border border-gray-300/50 bg-transparent px-2 py-1 text-xs font-normal text-black hover:bg-gray-100 hover:text-black focus-visible:ring-1 focus-visible:ring-ring-primary dark:border-gray-600 dark:bg-transparent dark:text-white dark:hover:bg-gray-600 dark:focus-visible:ring-white"
              onClick={() => setShowMentionPopover(true)}
            >
              <Plus className="mr-1 w-[14px]" />
              {localize('com_ui_prompts')}
            </Button>
          )}
        </div>
        {interfaceConfig?.parameters === true && (
          <PluginStoreDialog
            isOpen={showPluginStoreDialog}
            setIsOpen={setShowPluginStoreDialog}
          />
        )}
      </span>
    </div>
  );
}
