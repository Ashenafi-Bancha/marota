const BASE_PERMISSIONS = {
  accessAdminConsole: false,
  viewAnalytics: false,
  manageUsers: false,
  manageRoles: false,
  manageAdmissions: false,
  manageCurriculum: false,
  manageAssessments: false,
  moderateRatings: false,
  manageAnnouncements: false,
  viewAuditLog: false,
  viewPayments: false,
};

const OPERATOR_ADMIN_PERMISSIONS = {
  accessAdminConsole: true,
  viewAnalytics: true,
  manageUsers: true,
  manageRoles: false,
  manageAdmissions: true,
  manageCurriculum: true,
  manageAssessments: true,
  moderateRatings: true,
  manageAnnouncements: true,
  viewAuditLog: true,
  viewPayments: true,
};

const MASTER_ADMIN_PERMISSIONS = {
  ...OPERATOR_ADMIN_PERMISSIONS,
  manageRoles: true,
};

export const ADMIN_ROLES = ["admin", "super_admin", "master_admin", "owner"];
export const MASTER_ADMIN_ROLES = ["master_admin", "owner"];

export const ROLE_PERMISSIONS = {
  student: BASE_PERMISSIONS,
  admin: OPERATOR_ADMIN_PERMISSIONS,
  super_admin: OPERATOR_ADMIN_PERMISSIONS,
  master_admin: MASTER_ADMIN_PERMISSIONS,
  owner: MASTER_ADMIN_PERMISSIONS,
};

export const normalizeRole = (roleValue) =>
  String(roleValue || "student").trim().toLowerCase() || "student";

export const getPermissionsForRole = (roleValue) => {
  const normalizedRole = normalizeRole(roleValue);
  return ROLE_PERMISSIONS[normalizedRole] || BASE_PERMISSIONS;
};

export const canAccessAdminConsole = (roleValue) =>
  ADMIN_ROLES.includes(normalizeRole(roleValue));

export const isMasterAdminRole = (roleValue) =>
  MASTER_ADMIN_ROLES.includes(normalizeRole(roleValue));

export const hasRolePermission = (roleValue, permissionKey) => {
  const permissions = getPermissionsForRole(roleValue);
  return Boolean(permissions[permissionKey]);
};

export const ADMIN_PERMISSION_LABELS = {
  accessAdminConsole: "Access admin console",
  viewAnalytics: "View analytics and reports",
  manageUsers: "Manage learners",
  manageRoles: "Manage user roles",
  manageAdmissions: "Manage enrollment approvals",
  manageCurriculum: "Manage short-course curriculum",
  manageAssessments: "Manage quizzes, projects, and tests",
  moderateRatings: "Moderate course ratings",
  manageAnnouncements: "Manage platform announcements",
  viewAuditLog: "View admin activity audit log",
  viewPayments: "View payment operations",
};
