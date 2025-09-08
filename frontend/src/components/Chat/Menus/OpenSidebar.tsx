import { TooltipAnchor, Button } from '~/components/ui';
import { Sidebar } from '~/components/svg';
import { useLocalize } from '~/hooks';

export default function OpenSidebar({
  setNavVisible,
}: {
  setNavVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const localize = useLocalize();
  return (
    <TooltipAnchor
      description={localize('com_nav_open_sidebar')}
      render={
        <Button
          size="icon"
          variant="outline"
          data-testid="open-sidebar-button"
          aria-label={localize('com_nav_open_sidebar')}
          className="size-10 rounded-xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-100 p-2 hover:from-blue-100 hover:to-indigo-200 hover:border-blue-300/70 hover:shadow-md transition-all duration-200 max-md:hidden dark:border-blue-800/50 dark:from-blue-900/30 dark:to-indigo-900/30 dark:hover:from-blue-800/40 dark:hover:to-indigo-800/40 dark:hover:border-blue-700/70"
          onClick={() =>
            setNavVisible((prev) => {
              localStorage.setItem('navVisible', JSON.stringify(!prev));
              return !prev;
            })
          }
        >
          <Sidebar />
        </Button>
      }
    />
  );
}
