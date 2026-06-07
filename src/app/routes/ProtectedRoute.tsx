import { Navigate } from 'react-router-dom';
import { useRole, type UserRole } from '../../shared/auth/useRole';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    /** Хотя бы одна из этих ролей нужна для доступа */
    allowedRoles: UserRole[];
    /** Куда редиректить при отказе (по умолчанию на главную) */
    redirectTo?: string;
}

/**
 * Оборачивает Route: если у пользователя нет нужной роли — редиректит.
 */
export default function ProtectedRoute({
    children,
    allowedRoles,
    redirectTo = '/',
}: ProtectedRouteProps) {
    const { hasRole } = useRole();

    if (!hasRole(...allowedRoles)) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
}
