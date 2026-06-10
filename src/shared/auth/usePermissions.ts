import { useRole } from './useRole';

/**
 * Возвращает флаги разрешений для управления видимостью кнопок и форм.
 *
 * ADMIN   — полный доступ: создание, редактирование, удаление
 * MANAGER — создание + редактирование, без удаления
 * VIEWER  — только просмотр
 */
export function usePermissions() {
    const { isAdmin, isManager } = useRole();

    return {
        /** Может создавать записи (кнопка "Добавить") */
        canCreate: isAdmin || isManager,

        /** Может редактировать записи (кнопка "Изменить") */
        canEdit: isAdmin || isManager,

        /** Может удалять записи (кнопка "Удалить") */
        canDelete: isAdmin,

        /** Полный доступ администратора */
        isAdmin,

        /** Менеджер или выше */
        isManagerOrAbove: isAdmin || isManager,
    };
}
