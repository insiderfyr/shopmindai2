import { useMediaQuery, useAuthContext, useGetStartupConfig } from '~/hooks';
import { AddMultiConvo } from '~/components/Conversations';
import HeaderNewChat from './Input/HeaderNewChat';
import ExportAndShareMenu from './Menus/ExportAndShare';
import { useRecoilValue } from 'recoil';
import ModelSelector from './Input/ModelSelector';
import { useGetEndpointsQuery } from '~/data-provider';
import store from '~/store';
import PresetsMenu from './Menus/PresetsMenu';
import BookmarkMenu from './Menus/BookmarkMenu';
import TemporaryChat from './TemporaryChat';

export default function Header() {
  const { data: startupConfig } = useGetStartupConfig();
  const { data: endpointsConfig } = useGetEndpointsQuery();
  const { isAuthenticated } = useAuthContext();
  const hasAccessToBookmarks = useRecoilValue(store.hasAccessToBookmarksSelector);
  const hasAccessToMultiConvo = useRecoilValue(store.hasAccessToMultiConvoSelector);
  const interfaceConfig = startupConfig?.interface ?? {};

  if (!isAuthenticated) {
    return null;
  }

  if (!startupConfig) {
    return null;
  }

  if (!endpointsConfig) {
    return null;
  }

  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  return (
    <div className="sticky top-0 z-10 flex h-14 w-full items-center justify-between bg-white p-2 font-semibold text-text-primary dark:bg-gray-800">
      <div className="hide-scrollbar flex w-full items-center justify-between gap-2 overflow-x-auto">
        <div className="mx-1 flex items-center gap-2">
          <HeaderNewChat />
          <ModelSelector startupConfig={startupConfig} />
          {interfaceConfig.presets === true && interfaceConfig.modelSelect && <PresetsMenu />}
          {hasAccessToBookmarks === true && <BookmarkMenu />}
          {hasAccessToMultiConvo === true && <AddMultiConvo />}
          {isSmallScreen && (
            <>
              <ExportAndShareMenu
                isSharedButtonEnabled={startupConfig?.sharedLinksEnabled ?? false}
              />
              <TemporaryChat />
            </>
          )}
        </div>
        {!isSmallScreen && (
          <div className="flex items-center gap-2">
            <ExportAndShareMenu
              isSharedButtonEnabled={startupConfig?.sharedLinksEnabled ?? false}
            />
            <TemporaryChat />
          </div>
        )}
      </div>
      {/* Empty div for spacing */}
      <div />
    </div>
  );
}
