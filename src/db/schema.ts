import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from 'drizzle-orm/pg-core';

export const organizationRoleEnum = pgEnum('organization_role', ['Owner', 'Admin', 'Moderator']);

export const discordGuildStatusEnum = pgEnum('discord_guild_status', [
  'linked',
  'bot_missing',
  'sync_required',
  'disabled'
]);

export const managedServerStatusEnum = pgEnum('managed_server_status', [
  'online',
  'maintenance',
  'offline'
]);

export const organizationClaimStatusEnum = pgEnum('organization_claim_status', [
  'pending',
  'completed',
  'expired',
  'revoked'
]);

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull()
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' })
  },
  (table) => [index('session_user_id_idx').on(table.userId)]
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull()
  },
  (table) => [
    index('account_user_id_idx').on(table.userId),
    uniqueIndex('account_provider_account_idx').on(table.providerId, table.accountId)
  ]
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull()
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)]
);

export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id')
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull()
  },
  (table) => [index('organizations_slug_idx').on(table.slug)]
);

export const organizationMembers = pgTable(
  'organization_members',
  {
    id: uuid('id')
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    role: organizationRoleEnum('role').notNull(),
    permissions: text('permissions')
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    joinedAt: timestamp('joined_at').defaultNow().notNull()
  },
  (table) => [
    index('organization_members_user_id_idx').on(table.userId),
    index('organization_members_organization_id_idx').on(table.organizationId),
    uniqueIndex('organization_members_user_organization_idx').on(table.userId, table.organizationId)
  ]
);

export const discordGuildLinks = pgTable(
  'discord_guild_links',
  {
    id: uuid('id')
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    discordGuildId: text('discord_guild_id').notNull(),
    name: text('name').notNull(),
    iconUrl: text('icon_url'),
    ownerDiscordId: text('owner_discord_id').notNull(),
    status: discordGuildStatusEnum('status').default('linked').notNull(),
    memberCount: integer('member_count'),
    linkedAt: timestamp('linked_at').defaultNow().notNull(),
    lastSyncedAt: timestamp('last_synced_at')
  },
  (table) => [
    uniqueIndex('discord_guild_links_guild_idx').on(table.discordGuildId),
    uniqueIndex('discord_guild_links_organization_idx').on(table.organizationId)
  ]
);

export const managedServers = pgTable(
  'managed_servers',
  {
    id: uuid('id')
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    imageSeed: text('image_seed'),
    status: managedServerStatusEnum('status').default('offline').notNull(),
    robloxGroupId: text('roblox_group_id'),
    joinCode: text('join_code').notNull(),
    memberCount: integer('member_count').default(0).notNull(),
    staffCount: integer('staff_count').default(0).notNull(),
    activePlayers: integer('active_players').default(0).notNull(),
    openIncidents: integer('open_incidents').default(0).notNull(),
    lastSessionAt: timestamp('last_session_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull()
  },
  (table) => [index('managed_servers_organization_id_idx').on(table.organizationId)]
);

export const organizationClaims = pgTable(
  'organization_claims',
  {
    claimToken: text('claim_token').primaryKey(),
    claimUrl: text('claim_url').notNull(),
    discordGuildId: text('discord_guild_id').notNull(),
    discordGuildName: text('discord_guild_name').notNull(),
    guildOwnerDiscordId: text('guild_owner_discord_id').notNull(),
    commandUserDiscordId: text('command_user_discord_id').notNull(),
    botUserDiscordId: text('bot_user_discord_id').notNull(),
    botPermissions: text('bot_permissions').array().notNull(),
    iconUrl: text('icon_url'),
    memberCount: integer('member_count'),
    status: organizationClaimStatusEnum('status').default('pending').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at')
  },
  (table) => [
    index('organization_claims_discord_guild_id_idx').on(table.discordGuildId),
    index('organization_claims_status_idx').on(table.status)
  ]
);

export const botEvents = pgTable(
  'bot_events',
  {
    eventId: uuid('event_id').primaryKey(),
    type: text('type').notNull(),
    discordGuildId: text('discord_guild_id').notNull(),
    occurredAt: timestamp('occurred_at').notNull(),
    actorDiscordId: text('actor_discord_id'),
    payload: jsonb('payload'),
    acceptedAt: timestamp('accepted_at').defaultNow().notNull()
  },
  (table) => [index('bot_events_discord_guild_id_idx').on(table.discordGuildId)]
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id')
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    type: text('type').notNull(),
    organizationId: uuid('organization_id').references(() => organizations.id, {
      onDelete: 'set null'
    }),
    discordGuildId: text('discord_guild_id'),
    actorUserId: text('actor_user_id').references(() => user.id, { onDelete: 'set null' }),
    actorDiscordId: text('actor_discord_id'),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => [
    index('audit_logs_organization_id_idx').on(table.organizationId),
    index('audit_logs_discord_guild_id_idx').on(table.discordGuildId)
  ]
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  memberships: many(organizationMembers)
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id]
  })
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id]
  })
}));

export const organizationRelations = relations(organizations, ({ many, one }) => ({
  members: many(organizationMembers),
  servers: many(managedServers),
  discordGuildLink: one(discordGuildLinks, {
    fields: [organizations.id],
    references: [discordGuildLinks.organizationId]
  })
}));

export const organizationMemberRelations = relations(organizationMembers, ({ one }) => ({
  user: one(user, {
    fields: [organizationMembers.userId],
    references: [user.id]
  }),
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id]
  })
}));

export const managedServerRelations = relations(managedServers, ({ one }) => ({
  organization: one(organizations, {
    fields: [managedServers.organizationId],
    references: [organizations.id]
  })
}));

export const schema = {
  user,
  session,
  account,
  verification,
  organizations,
  organizationMembers,
  discordGuildLinks,
  managedServers,
  organizationClaims,
  botEvents,
  auditLogs
};
