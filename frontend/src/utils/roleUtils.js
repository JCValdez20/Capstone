// src/utils/roleUtils.js
export const getRoles = (user) => {
  if (!user || !user.roles) return [];
  return Array.isArray(user.roles) ? user.roles : [user.roles];
};

export const isAdmin = (roles) => roles.includes("admin");
export const isStaff = (roles) => roles.includes("staff");
export const isCustomer = (roles) =>
  !roles.includes("admin") && !roles.includes("staff");
