// No auth/login flow — every request acts as this single seeded user
// (see prisma/seed.ts). Keeps the User/Project/Analysis foreign keys intact
// without requiring a schema migration.
export const LOCAL_USER_ID = '00000000-0000-0000-0000-000000000001';
