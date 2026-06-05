# Roadmap: Discord-Only Backend Auth, Organizations, and Bot

## Summary

This roadmap moves Rolvise from local mock authentication and local-storage server selection
to a Discord-only, backend-backed application model.

Chosen defaults:

- Auth: Better Auth with Discord as the only social provider.
- Database: Postgres + Drizzle.
- Bot: separate long-running Discord worker process.
- Organization creation: only Discord guild owners can create/connect a Rolvise organization,
  initiated through a bot command.

## Phase 1: Backend Foundations

- Add Postgres + Drizzle as the source of truth for users, Discord accounts, organizations,
  Discord guild links, managed ER:LC servers, memberships, roles, and audit logs.
- Add Better Auth server configuration with Discord as the only enabled provider.
- Disable or remove email/password mock login and sign-up as user-facing flows.
- Replace the mock auth cookie in `src/proxy.ts` with Better Auth session checks.
- Keep `/auth/sign-in`, but make it a single `Continue with Discord` page.
- Redirect authenticated users without an organization to the Discord onboarding/claim flow.
- Redirect authenticated users with at least one organization to `/dashboard/servers`.
- Keep mock feature data temporarily while replacing the app-level identity and organization
  context first.

## Phase 2: Core Data Model

Initial schema:

- `users`: Better Auth user plus Discord profile fields needed by Rolvise.
- `accounts` / `sessions`: Better Auth-managed account and session tables.
- `organizations`: Rolvise-managed community container.
- `organization_members`: user, organization, role, and permission source.
- `discord_guild_links`: unique Discord guild link with `discordGuildId`, `organizationId`,
  install state, bot status, and owner-link metadata.
- `managed_servers`: ER:LC server records scoped to one organization.
- `discord_role_mappings`: Discord role IDs mapped to Rolvise roles and permissions.
- `audit_logs`: auth, organization claim, bot sync, settings changes, and security events.

Important constraints:

- A Discord guild can be linked to only one Rolvise organization.
- A Rolvise organization can have one primary Discord guild link for v1.
- Organization creation requires verified Discord guild ownership from the bot-command flow.
- Discord guild ownership and Discord `Manage Server` / `Administrator` permissions are separate
  concepts; v1 organization creation requires the actual guild owner.
- Organization and managed server IDs should become backend IDs, not local-storage-only values.

## Phase 3: Web App Routes and API Surface

Required app routes:

- `GET /auth/sign-in`: Discord-only login page.
- `GET /dashboard/servers`: first authenticated app destination.
- `GET /dashboard/onboarding/discord`: claim/connect status UI for users without an organization.

Required API routes:

- `GET /api/auth/[...all]`: Better Auth route handler.
- `POST /api/auth/[...all]`: Better Auth route handler.
- `POST /api/organizations/claim/start`: create a pending organization claim from a bot-issued
  token.
- `POST /api/organizations/claim/complete`: verify the logged-in Discord user owns the guild,
  then create/link the organization.
- `GET /api/me`: return current user, organizations, memberships, permissions, and active
  organization defaults.
- `GET /api/organizations/:id/servers`: replace the current mock server service later.
- `POST /api/bot/events`: signed bot-to-web callback endpoint for guild/member sync and audit
  events.

Implementation notes:

- Keep components importing through service/query layers so the mock backend can be swapped
  feature by feature.
- Server-side authorization must live in route handlers, server actions, or backend services;
  navigation filtering remains UX only.
- The onboarding page should explain that setup starts from Discord with `/rolvise setup`.

## Phase 4: Discord Bot Roadmap

The bot worker must:

- Use `discord.js` v14.
- Run as a separate long-lived worker process, not inside the Next.js request lifecycle.
- Register owner/admin slash commands.
- Maintain a secure bot API token for server-to-server calls into the Next backend.
- Validate command user permissions from Discord before starting claim flows.
- Send guild, member, and role metadata to the backend after installation, claim, or manual sync.

Initial commands:

- `/rolvise setup`: owner-only command that starts organization claim and returns a one-time web
  link.
- `/rolvise status`: shows whether this guild is connected to Rolvise.
- `/rolvise unlink`: owner-only command to request unlinking or start an unlink flow.
- `/rolvise sync`: owner/admin command to sync guild roles and selected members.
- `/rolvise roles`: show or refresh configured role mappings.

Bot responsibilities:

- Confirm the command runner is the guild owner for organization creation.
- Confirm the bot is installed in the same guild being claimed.
- Send guild ID, guild name, owner ID, member count, bot permissions, and claim token to the
  backend.
- Optionally sync guild roles for permission mapping.
- Avoid making the bot the primary auth provider; web login remains Discord OAuth through
  Better Auth.

Claim flow:

1. Guild owner runs `/rolvise setup`.
2. Bot verifies `interaction.guild.ownerId === interaction.user.id`.
3. Bot requests a one-time claim token from the backend.
4. Bot replies privately with a claim URL to `/dashboard/onboarding/discord?claim=...`.
5. User signs in with Discord if needed.
6. Backend verifies the signed-in Discord user ID matches the guild owner ID from the claim.
7. Backend creates the organization, links the Discord guild once, creates owner membership, and
   writes audit logs.

## Phase 5: Migration From Mock State

- Replace `getMockSession()` usages with Better Auth session helpers.
- Replace `useCommunity()` mock user with authenticated user and organization membership data.
- Replace local-storage selected server with a persisted user preference or URL/server context.
- Keep mock feature data temporarily, but scope it by real `organizationId` and `managedServerId`.
- Update privacy, about, and auth page copy to remove mock-auth language.
- Preserve the existing dashboard shell, sidebar server switcher, page container, and feature
  service-layer patterns.

Recommended migration order:

1. Add Better Auth, Drizzle, and database schema without changing user-facing pages.
2. Add Discord-only sign-in and Better Auth route handlers.
3. Replace `src/proxy.ts` auth checks.
4. Add `/api/me` and make `useCommunity()` consume real user/org membership state.
5. Add Discord onboarding and claim routes.
6. Add bot worker and `/rolvise setup`.
7. Move managed server listing from mock data to the database.
8. Gradually migrate feature data by organization/server scope.

## Phase 6: Security and Operations

- Store `DATABASE_URL`, `BETTER_AUTH_SECRET`, Discord client credentials, Discord bot token, and
  bot API token in environment variables.
- Sign bot callbacks with a shared secret or HMAC header.
- Enforce authorization on server/API routes, not only in navigation.
- Add audit logs for login, organization claim, bot install, role sync, unlink attempts, and
  permission changes.
- Add rate limits for claim start, claim complete, auth-sensitive API routes, and bot callback
  routes.
- Ensure claim tokens are single-use, expire quickly, and are bound to a Discord guild ID and
  guild owner ID.
- Reject bot events for unlinked guilds unless the event is part of the setup/claim handshake.
- Add operational health checks for the bot worker and backend database connection.

## Test Plan

- User cannot access `/dashboard/*` without a Better Auth session.
- Sign-in page only offers Discord login.
- Discord login creates or updates the user and session.
- User without a linked organization lands in onboarding.
- User with a linked organization lands on `/dashboard/servers`.
- `/rolvise setup` only works for the Discord guild owner.
- Claim link cannot be reused and expires.
- One Discord guild cannot be linked to two organizations.
- After successful claim, organization and guild link records are created.
- Successful claim creates the owner organization membership.
- Bot status/sync routes reject unsigned or invalid bot requests.
- Existing dashboard server selector reads real organization/server context.
- Server-side API authorization rejects users without the required organization membership.

