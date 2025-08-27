import { cn } from '~/utils';

type TSubRowProps = {
  children: React.ReactNode;
  classes?: string;
  subclasses?: string;
  onClick?: () => void;
  isUserMessage?: boolean;
};

export default function SubRow({ children, classes = '', onClick, isUserMessage = false }: TSubRowProps) {
  return (
    <div
      className={cn(
        'mt-1 flex gap-3 empty:hidden lg:flex',
        isUserMessage 
          ? 'opacity-0 group-hover:opacity-100 transition-opacity duration-200 justify-end' 
          : 'justify-start',
        classes
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
