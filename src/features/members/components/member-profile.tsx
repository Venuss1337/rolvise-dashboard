'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { memberByIdOptions } from '../api/queries';

export function MemberProfile({ memberId }: { memberId: string }) {
  const { data: member } = useSuspenseQuery(memberByIdOptions(memberId));

  if (!member) {
    notFound();
  }

  return (
    <Card className='max-w-3xl rounded-lg'>
      <CardHeader>
        <div className='flex items-center gap-3'>
          <Avatar className='size-12'>
            <AvatarImage src={member.discordAvatarUrl ?? undefined} alt={member.discordUsername} />
            <AvatarFallback>{member.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{member.displayName}</CardTitle>
            <div className='text-muted-foreground text-sm'>{member.discordUsername}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className='grid gap-4 sm:grid-cols-3'>
        <div>
          <div className='text-muted-foreground text-sm'>Join date</div>
          <div className='font-medium'>{new Date(member.joinedAt).toLocaleDateString()}</div>
        </div>
        <div>
          <div className='text-muted-foreground text-sm'>Roles</div>
          <div className='mt-1 flex flex-wrap gap-1'>
            {member.roles.length > 0 ? (
              member.roles.map((role) => (
                <Badge key={role} variant='secondary'>
                  {role}
                </Badge>
              ))
            ) : (
              <Badge variant='outline'>None</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
