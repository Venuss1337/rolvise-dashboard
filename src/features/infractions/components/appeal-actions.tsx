import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';

type AppealActionsProps = {
  onApprove: () => void;
  onDeny: () => void;
  disabled?: boolean;
};

export function AppealActions({ onApprove, onDeny, disabled = false }: AppealActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='size-8'>
          <span className='sr-only'>Open appeal actions</span>
          <Icons.ellipsis className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem>View Appeal</DropdownMenuItem>
        <DropdownMenuItem disabled={disabled} onClick={onApprove}>
          Approve Appeal
        </DropdownMenuItem>
        <DropdownMenuItem disabled={disabled} variant='destructive' onClick={onDeny}>
          Deny Appeal
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
