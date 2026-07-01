export const userRoles = [
  "GUEST",
  "CUSTOMER",
  "RESELLER",
  "SUPPORT_AGENT",
  "ADMIN",
  "SUPER_ADMIN",
  "DEVELOPER"
] as const;

export type UserRole = (typeof userRoles)[number];

export const userStatuses = ["active", "inactive", "suspended", "banned"] as const;
export type UserStatus = (typeof userStatuses)[number];
