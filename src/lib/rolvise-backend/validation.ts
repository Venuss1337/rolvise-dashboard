import { z } from 'zod';

export const discordSnowflakeSchema = z.string().regex(/^[0-9]{17,20}$/);
export const isoDateTimeSchema = z.string().datetime();

const relativeRedirectSchema = z
  .string()
  .default('/dashboard/servers')
  .refine((value) => value.startsWith('/') && !value.startsWith('//'), {
    message: 'redirectTo must be a relative URL.'
  });

export const startDiscordLoginSchema = z
  .object({
    redirectTo: relativeRedirectSchema.optional()
  })
  .strict()
  .optional();

export const startOrganizationClaimSchema = z
  .object({
    discordGuildId: discordSnowflakeSchema,
    discordGuildName: z.string().min(1).max(100),
    guildOwnerDiscordId: discordSnowflakeSchema,
    commandUserDiscordId: discordSnowflakeSchema,
    botUserDiscordId: discordSnowflakeSchema,
    memberCount: z.number().int().min(0).nullable().optional(),
    iconUrl: z.string().url().nullable().optional(),
    botPermissions: z.array(z.string()).min(1),
    issuedAt: isoDateTimeSchema
  })
  .strict();

export const completeOrganizationClaimSchema = z
  .object({
    claimToken: z.string().min(32).max(256),
    organizationName: z.string().min(2).max(100),
    initialServerName: z.string().min(2).max(100).nullable().optional(),
    initialServerJoinCode: z.string().min(2).max(32).nullable().optional()
  })
  .strict();

export const managedServerStatusSchema = z.enum(['online', 'maintenance', 'offline']);

export const managedServerQuerySchema = z.object({
  status: managedServerStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().optional()
});

export const communityMemberQuerySchema = z.object({
  serverId: z.string().uuid(),
  search: z.string().max(100).optional(),
  role: z.string().max(100).optional(),
  sortBy: z.enum(['displayName', 'discordUsername', 'joinedAt']).default('displayName'),
  sortDirection: z.enum(['asc', 'desc']).default('asc')
});

export const communityRoleInputSchema = z
  .object({
    serverId: z.string().uuid(),
    name: z.string().min(2).max(64),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    permissions: z.array(z.string().min(1).max(80)).default([])
  })
  .strict();

export const communityRolePatchSchema = z
  .object({
    name: z.string().min(2).max(64).optional(),
    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .optional(),
    permissions: z.array(z.string().min(1).max(80)).optional()
  })
  .strict();

export const createDashboardInviteSchema = z
  .object({
    serverId: z.string().uuid(),
    roleId: z.string().uuid().nullable().optional(),
    maxUses: z.number().int().min(1).max(500).nullable().optional(),
    expiresInHours: z
      .number()
      .int()
      .min(1)
      .max(24 * 30)
      .nullable()
      .optional()
  })
  .strict();

export const botEventSchema = z
  .object({
    eventId: z.string().uuid(),
    type: z.enum([
      'guild_installed',
      'guild_removed',
      'guild_sync',
      'member_sync',
      'role_sync',
      'setup_started',
      'status_checked'
    ]),
    discordGuildId: discordSnowflakeSchema,
    occurredAt: isoDateTimeSchema,
    actorDiscordId: discordSnowflakeSchema.nullable().optional(),
    payload: z.unknown().optional()
  })
  .strict();

export type StartOrganizationClaimInput = z.infer<typeof startOrganizationClaimSchema>;
export type CompleteOrganizationClaimInput = z.infer<typeof completeOrganizationClaimSchema>;
export type CommunityMemberQueryInput = z.infer<typeof communityMemberQuerySchema>;
export type CommunityRoleInput = z.infer<typeof communityRoleInputSchema>;
export type CommunityRolePatchInput = z.infer<typeof communityRolePatchSchema>;
export type CreateDashboardInviteInput = z.infer<typeof createDashboardInviteSchema>;
export type BotEventInput = z.infer<typeof botEventSchema>;
