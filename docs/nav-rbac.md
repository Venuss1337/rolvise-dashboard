# Navigation and Community Access

Navigation visibility is UX only. Real authorization must be enforced by API routes,
server actions, or the eventual backend.

The app no longer uses Clerk. Community context is provided by:

- `src/features/community/hooks/use-community.ts`
- `src/features/servers/hooks/use-selected-server.ts`
- `src/features/servers/api/*`

Use `useCommunity()` in client components when a page needs the selected ER:LC community,
the current mock user, role, permissions, or community switching.

```tsx
const { community, role, permissions, can, switchCommunity } = useCommunity();
```

Current mock roles:

- `Owner`
- `Admin`
- `Moderator`

Current mock permissions:

- `community:view`
- `community:manage`
- `staff:view`
- `staff:manage`
- `cases:view`
- `cases:manage`
- `settings:manage`

Before production, replace mock permission checks with backend-backed checks.
