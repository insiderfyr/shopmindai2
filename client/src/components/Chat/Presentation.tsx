import { useRecoilValue } from 'recoil';
import { useEffect, useMemo } from 'react';
import { FileSources, LocalStorageKeys } from 'librechat-data-provider';
import type { ExtendedFile } from '~/common';
import { useDeleteFilesMutation } from '~/data-provider';
import DragDropWrapper from '~/components/Chat/Input/Files/DragDropWrapper';
import Artifacts from '~/components/Artifacts/Artifacts';
import { ResizableHandleAlt, ResizablePanel, ResizablePanelGroup } from '~/components/ui/Resizable';
import { normalizeLayout } from '~/utils';
import throttle from 'lodash/throttle';
import { useSetFilesToDelete } from '~/hooks';
import { EditorProvider } from '~/Providers';
import store from '~/store';

export default function Presentation({ children }: { children: React.ReactNode }) {
  const artifacts = useRecoilValue(store.artifactsState);
  const artifactsVisibility = useRecoilValue(store.artifactsVisibility);

  const setFilesToDelete = useSetFilesToDelete();

  const { mutateAsync } = useDeleteFilesMutation({
    onSuccess: () => {
      console.log('Temporary Files deleted');
      setFilesToDelete({});
    },
    onError: (error) => {
      console.log('Error deleting temporary files:', error);
    },
  });

  useEffect(() => {
    const filesToDelete = localStorage.getItem(LocalStorageKeys.FILES_TO_DELETE);
    const map = JSON.parse(filesToDelete ?? '{}') as Record<string, ExtendedFile>;
    const files = Object.values(map)
      .filter(
        (file) =>
          file.filepath != null && file.source && !(file.embedded ?? false) && file.temp_file_id,
      )
      .map((file) => ({
        file_id: file.file_id,
        filepath: file.filepath as string,
        source: file.source as FileSources,
        embedded: !!(file.embedded ?? false),
      }));

    if (files.length === 0) {
      return;
    }
    mutateAsync({ files });
  }, [mutateAsync]);

  const calculateLayout = useMemo(() => {
    if (artifacts == null || Object.keys(artifacts ?? {}).length === 0 || artifactsVisibility !== true) {
      return [100];
    } else {
      return [50, 50];
    }
  }, [artifacts, artifactsVisibility]);

  const currentLayout = useMemo(() => normalizeLayout(calculateLayout), [calculateLayout]);

  const throttledSaveLayout = useMemo(
    () =>
      throttle((sizes: number[]) => {
        const normalizedSizes = normalizeLayout(sizes);
        localStorage.setItem('react-resizable-panels:layout', JSON.stringify(normalizedSizes));
      }, 350),
    [],
  );

  const minSizeMain = useMemo(() => (artifacts != null && Object.keys(artifacts ?? {}).length > 0 && artifactsVisibility === true ? 15 : 30), [artifacts, artifactsVisibility]);

  return (
    <DragDropWrapper className="relative flex w-full grow overflow-hidden bg-presentation">
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes) => throttledSaveLayout(sizes)}
        className="transition-width relative h-full w-full flex-1 overflow-auto bg-presentation"
      >
        <ResizablePanel
          defaultSize={currentLayout[0]}
          minSize={minSizeMain}
          order={1}
          id="messages-view"
        >
          <main className="flex h-full flex-col overflow-y-auto" role="main">
            {children}
          </main>
        </ResizablePanel>
        {artifactsVisibility === true && Object.keys(artifacts ?? {}).length > 0 && (
          <>
            <ResizableHandleAlt withHandle className="ml-3 bg-border-medium text-text-primary" />
            <ResizablePanel
              defaultSize={currentLayout[1]}
              minSize={minSizeMain}
              order={2}
              id="artifacts-panel"
            >
              <EditorProvider>
                <Artifacts />
              </EditorProvider>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </DragDropWrapper>
  );
}
