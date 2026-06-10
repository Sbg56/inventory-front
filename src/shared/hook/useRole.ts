import { useKeycloak } from '@react-keycloak/web';

type Role = 'ADMIN' | 'MANAGER' | 'VIEWER';

export function useRole() {
    const { keycloak } = useKeycloak();

    const roles: Role[] = (keycloak.tokenParsed?.resource_access?.['inventory-front']?.roles ?? []) as Role[];

    const hasRole = (role: Role) => roles.includes(role);
    const hasAnyRole = (...checkRoles: Role[]) => checkRoles.some(r => roles.includes(r));

    const isAdmin = hasRole('ADMIN');
    const isManager = hasRole('MANAGER');
    const isViewer = hasRole('VIEWER');

    // может создавать и редактировать
    const canWrite = hasAnyRole('ADMIN', 'MANAGER');
    // может удалять
    const canDelete = isAdmin;

    return { isAdmin, isManager, isViewer, canWrite, canDelete, hasRole, hasAnyRole };
}