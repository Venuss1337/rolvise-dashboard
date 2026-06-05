'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCommunity } from '@/features/community/hooks/use-community';

export default function ProfileViewPage() {
  const { user, community, role, permissions } = useCommunity();

  return (
    <div className='flex w-full flex-col p-4'>
      <Card className='max-w-2xl rounded-lg'>
        <CardHeader>
          <CardTitle>Mock Profile</CardTitle>
          <CardDescription>Local development identity for dashboard testing.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <div className='text-muted-foreground text-sm'>Name</div>
            <div className='font-medium'>{user.name}</div>
          </div>
          <div>
            <div className='text-muted-foreground text-sm'>Email</div>
            <div className='font-medium'>{user.email}</div>
          </div>
          <div>
            <div className='text-muted-foreground text-sm'>Selected community</div>
            <div className='font-medium'>{community?.name ?? 'None selected'}</div>
          </div>
          <div className='flex flex-wrap gap-2'>
            {role && <Badge variant='outline'>{role}</Badge>}
            {permissions.map((permission) => (
              <Badge key={permission} variant='secondary'>
                {permission}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
