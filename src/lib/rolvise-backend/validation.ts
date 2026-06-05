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
export type BotEventInput = z.infer<typeof botEventSchema>;
