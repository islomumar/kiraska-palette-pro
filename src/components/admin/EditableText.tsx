import { ReactNode } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useSiteContent } from '@/hooks/useSiteContent';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  contentKey: string;
  fallback?: string;
  children?: ReactNode;
  className?: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div';
}

export function EditableText({ 
  contentKey, 
  fallback = '', 
  children, 
  className,
  as: Component = 'span' 
}: EditableTextProps) {
  const { isEditMode, setEditingKey } = useEditMode();
  const { getText } = useSiteContent();

  const text = getText(contentKey, fallback);
  const displayContent = children || text;

  if (!isEditMode) {
    return <Component className={className}>{displayContent}</Component>;
  }

  return (
    <Component 
      className={cn(className, 'group/editable relative inline')}
    >
      {displayContent}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setEditingKey(contentKey);
        }}
        className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded bg-primary/90 text-primary-foreground opacity-0 group-hover/editable:opacity-100 transition-opacity hover:bg-primary cursor-pointer"
        title={`Edit: ${contentKey}`}
      >
        <Pencil className="h-3 w-3" />
      </button>
    </Component>
  );
}
