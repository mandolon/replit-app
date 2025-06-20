import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Undo2 } from "lucide-react";
export interface UnifiedToastOptions {
  itemType: 'task' | 'project' | 'note' | 'user' | 'item';
  itemName: string;
  action: 'created' | 'updated' | 'deleted' | 'restored' | 'completed' | 'moved' | 'archived' | 'assigned' | 'duplicated';
  destination?: string; // For "moved to" actions
  variant?: 'default' | 'destructive';
  
  // Action buttons
  undoAction?: () => void;
  navigateToPage?: string;
  navigateLabel?: string;
  
  // Custom overrides
  customMessage?: string;
  duration?: number;
}

export const useUnifiedToast = () => {
  const { toast } = useToast();

  const showToast = (options: UnifiedToastOptions) => {
    const {
      itemType,
      itemName,
      action,
      destination,
      variant = 'default',
      undoAction,
      navigateToPage,
      navigateLabel,
      customMessage,
      duration = 4000
    } = options;

    // Capitalize item type for display
    const displayType = itemType.charAt(0).toUpperCase() + itemType.slice(1);
    
    // Generate message based on action
    let message: string;
    
    if (customMessage) {
      message = customMessage;
    } else {
      switch (action) {
        case 'created':
          message = `${displayType} "${itemName}" created.`;
          break;
        case 'updated':
          message = `${displayType} "${itemName}" updated.`;
          break;
        case 'deleted':
          message = `${displayType} "${itemName}" deleted.`;
          break;
        case 'restored':
          message = `${displayType} "${itemName}" restored.`;
          break;
        case 'completed':
          message = `${displayType} "${itemName}" completed.`;
          break;
        case 'moved':
          message = destination 
            ? `${displayType} "${itemName}" moved to ${destination}.`
            : `${displayType} "${itemName}" moved.`;
          break;
        case 'archived':
          message = `${displayType} "${itemName}" archived.`;
          break;
        case 'assigned':
          message = destination
            ? `${displayType} "${itemName}" assigned to ${destination}.`
            : `${displayType} "${itemName}" assigned.`;
          break;
        case 'duplicated':
          message = `${displayType} "${itemName}" duplicated.`;
          break;
        default:
          message = `${displayType} "${itemName}" ${action}.`;
      }
    }

    // Determine which action to show (undo takes precedence for small actions)
    let toastAction: any = null;
    
    if (undoAction) {
      toastAction = (
        <button 
          onClick={undoAction}
          className="text-xs font-medium text-primary hover:text-primary/80 underline underline-offset-2 flex items-center gap-1 whitespace-nowrap"
        >
          <Undo2 className="w-3 h-3" />
          Undo
        </button>
      );
    } else if (navigateToPage && navigateLabel) {
      toastAction = (
        <button 
          onClick={() => window.location.href = navigateToPage}
          className="text-xs font-medium text-primary hover:text-primary/80 underline underline-offset-2 whitespace-nowrap"
        >
          {navigateLabel}
        </button>
      );
    }

    // Split message into parts for different font weights
    const parts = message.match(/^(\w+)\s+"([^"]+)"\s+moved to (.+)\.$/);
    
    let formattedMessage;
    if (parts) {
      const [, itemType, itemName, destination] = parts;
      const isTrashDestination = destination === 'trash';
      
      formattedMessage = (
        <span className="leading-tight">
          <span className="text-muted-foreground font-normal">{itemType}</span>
          <span className="text-foreground font-medium mx-1">"{itemName}"</span>
          <span className="text-muted-foreground font-normal">moved to </span>
          {isTrashDestination ? (
            <button 
              onClick={() => window.location.href = '/settings?tab=trash'}
              className="text-foreground font-medium underline decoration-dotted underline-offset-2 hover:text-primary"
            >
              {destination}
            </button>
          ) : (
            <span className="text-foreground font-medium">{destination}</span>
          )}
          <span className="text-muted-foreground font-normal">.</span>
        </span>
      );
    } else {
      formattedMessage = <span className="font-medium text-foreground">{message}</span>;
    }

    toast({
      description: formattedMessage,
      variant,
      action: toastAction,
      duration
    });
  };

  return { showToast };
};

// Convenience hooks for common patterns
export const useProjectToast = () => {
  const { showToast } = useUnifiedToast();
  
  return {
    projectCreated: (name: string) => showToast({
      itemType: 'project',
      itemName: name,
      action: 'created',
      navigateToPage: '/projects',
      navigateLabel: 'View Projects'
    }),
    
    projectUpdated: (name: string) => showToast({
      itemType: 'project',
      itemName: name,
      action: 'updated'
    }),
    
    projectStatusChanged: (name: string, status: string) => showToast({
      itemType: 'project',
      itemName: name,
      action: 'moved',
      destination: status,
      navigateToPage: '/projects',
      navigateLabel: 'View Projects'
    }),
    
    projectDeleted: (name: string, undoFn?: () => void) => showToast({
      itemType: 'project',
      itemName: name,
      action: 'moved',
      destination: 'trash',
      undoAction: undoFn
    })
  };
};

export const useTaskToast = () => {
  const { showToast } = useUnifiedToast();
  
  return {
    taskCreated: (name: string) => showToast({
      itemType: 'task',
      itemName: name,
      action: 'created',
      navigateToPage: '/tasks',
      navigateLabel: 'View Tasks'
    }),
    
    taskUpdated: (name: string) => showToast({
      itemType: 'task',
      itemName: name,
      action: 'updated'
    }),
    
    taskCompleted: (name: string, undoFn?: () => void) => showToast({
      itemType: 'task',
      itemName: name,
      action: 'completed',
      undoAction: undoFn
    }),
    
    taskDeleted: (name: string, undoFn?: () => void) => showToast({
      itemType: 'task',
      itemName: name,
      action: 'moved',
      destination: 'trash',
      undoAction: undoFn
    }),
    
    taskAssigned: (name: string, assignee: string) => showToast({
      itemType: 'task',
      itemName: name,
      action: 'assigned',
      destination: assignee
    })
  };
};

export const useTrashToast = () => {
  const { showToast } = useUnifiedToast();
  
  return {
    itemRestored: (type: 'task' | 'project' | 'note', name: string) => showToast({
      itemType: type,
      itemName: name,
      action: 'restored',
      navigateToPage: type === 'project' ? '/projects' : '/tasks',
      navigateLabel: type === 'project' ? 'View Projects' : 'View Tasks'
    }),
    
    itemDeleted: (type: 'task' | 'project' | 'note', name: string) => showToast({
      itemType: type,
      itemName: name,
      action: 'moved',
      destination: 'trash'
    }),
    
    trashEmptied: () => showToast({
      itemType: 'item',
      itemName: 'All items',
      action: 'deleted',
      customMessage: 'Trash emptied.'
    })
  };
};