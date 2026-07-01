import type { UserRole } from "@/types/auth";

export const roleRank: Record<UserRole, number> = {
  GUEST: 0,
  CUSTOMER: 10,
  RESELLER: 20,
  SUPPORT_AGENT: 30,
  ADMIN: 40,
  SUPER_ADMIN: 50,
  DEVELOPER: 60
};

export function hasRole(currentRole: UserRole, minimumRole: UserRole): boolean {
  return roleRank[currentRole] >= roleRank[minimumRole];
}

export function isStaffRole(role: UserRole): boolean {
  return hasRole(role, "SUPPORT_AGENT");
}
