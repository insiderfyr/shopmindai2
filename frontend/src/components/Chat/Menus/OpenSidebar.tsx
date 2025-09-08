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
          className="size-8 rounded-xl border-transparent bg-transparent p-1.5 hover:bg-gray-100/30 hover:scale-105 transition-all duration-200 max-md:hidden"
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
