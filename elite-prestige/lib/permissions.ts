export const PERMISSIONS = {
  VEHICLES_VIEW: "vehicles.view",
  VEHICLES_EDIT: "vehicles.edit",
  YACHT_VIEW: "yacht.view",
  YACHT_EDIT: "yacht.edit",
  THEME_VIEW: "theme.view",
  THEME_EDIT: "theme.edit",
  USERS_MANAGE: "users.manage",
  ROLES_MANAGE: "roles.manage",
  RESERVATIONS_VIEW: "reservations.view",
  INVOICES_VIEW: "invoices.view",
  INVOICES_CREATE: "invoices.create",
  INVOICES_DELETE: "invoices.delete",
  DASHBOARD_VIEW: "dashboard.view",
  ACCOUNTING_VIEW: "accounting.view",
  ACCOUNTING_EDIT: "accounting.edit",
  ARCHIVES_VIEW: "archives.view",
  ARCHIVES_MANAGE: "archives.manage",
  SERVICE_USE: "service.use"
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: { key: Permission; label: string }[] = [
  { key: PERMISSIONS.VEHICLES_VIEW, label: "Voir la flotte (back-office)" },
  { key: PERMISSIONS.VEHICLES_EDIT, label: "Ajouter / modifier / supprimer des véhicules" },
  { key: PERMISSIONS.YACHT_VIEW, label: "Voir le configurateur Yacht (back-office)" },
  { key: PERMISSIONS.YACHT_EDIT, label: "Gérer le configurateur Yacht (forfaits, options, prix)" },
  { key: PERMISSIONS.THEME_VIEW, label: "Voir les couleurs du site (back-office)" },
  { key: PERMISSIONS.THEME_EDIT, label: "Modifier les couleurs du site (fond, boutons, texte, titres)" },
  { key: PERMISSIONS.USERS_MANAGE, label: "Gérer les comptes collaborateurs" },
  { key: PERMISSIONS.ROLES_MANAGE, label: "Gérer les rôles et permissions" },
  { key: PERMISSIONS.RESERVATIONS_VIEW, label: "Voir les demandes de réservation" },
  { key: PERMISSIONS.INVOICES_VIEW, label: "Voir toutes les factures" },
  { key: PERMISSIONS.INVOICES_CREATE, label: "Créer une facture" },
  { key: PERMISSIONS.INVOICES_DELETE, label: "Supprimer une facture" },
  { key: PERMISSIONS.DASHBOARD_VIEW, label: "Voir le tableau de bord (graphiques)" },
  { key: PERMISSIONS.ACCOUNTING_VIEW, label: "Voir la comptabilité" },
  { key: PERMISSIONS.ACCOUNTING_EDIT, label: "Modifier la comptabilité (solde, dépenses, impôts, clôture)" },
  { key: PERMISSIONS.ARCHIVES_VIEW, label: "Voir les archives (comptabilité et clients)" },
  { key: PERMISSIONS.ARCHIVES_MANAGE, label: "Supprimer des archives ou des clients" },
  { key: PERMISSIONS.SERVICE_USE, label: "Prendre son service (pointeuse)" }
];

export function hasPermission(
  userPermissions: string[] | undefined | null,
  permission: Permission
): boolean {
  return !!userPermissions?.includes(permission);
}
