import { useKeycloak } from '@react-keycloak/web';

export type UserRole = 'ADMIN' | 'MANAGER' | 'VIEWER';

/**
 * Возвращает роли текущего пользователя из Keycloak.
 * Роли берутся из resource_access -> inventory-front -> roles
 */
export function useRole() {
    const { keycloak } = useKeycloak();

    const resourceAccess = keycloak.tokenParsed?.resource_access as
        | Record<string, { roles: string[] }>
        | undefined;

    const roles: UserRole[] = (resourceAccess?.['inventory-front']?.roles ?? []) as UserRole[];

    const hasRole = (...check: UserRole[]) =>
        check.some((r) => roles.includes(r));

    const isAdmin    = hasRole('ADMIN');
    const isManager  = hasRole('MANAGER');
    const isViewer   = hasRole('VIEWER');

    return { roles, hasRole, isAdmin, isManager, isViewer };
}
