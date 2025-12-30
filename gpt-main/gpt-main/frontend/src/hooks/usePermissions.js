import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to check if the current user has admin role
 * @returns {boolean} true if user is admin, false otherwise
 */
export const useIsAdmin = () => {
    const { user } = useAuth();

    if (!user || !user.roles) {
        return false;
    }

    // Check if user has Admin role
    return user.roles.some(role => role === 'Admin' || role.name === 'Admin');
};

/**
 * Custom hook to check if user has specific permission
 * @param {string} permission - Permission to check
 * @returns {boolean} true if user has permission
 */
export const useHasPermission = (permission) => {
    const { user } = useAuth();

    if (!user || !user.roles) {
        return false;
    }

    // Admin has all permissions
    if (user.roles.some(role => role === 'Admin' || role.name === 'Admin')) {
        return true;
    }

    // Check specific permission based on role
    const permissionMatrix = {
        'Admin': ['*'],
        'Editor': ['EDIT_TRACKER', 'VIEW_REPORTS', 'IMPORT_DATA', 'VIEW_POS'],
        'Viewer': ['VIEW_REPORTS', 'VIEW_POS'],
        'Approver': ['APPROVE_CHANGES', 'VIEW_REPORTS'],
    };

    return user.roles.some(role => {
        const roleName = typeof role === 'string' ? role : role.name;
        const permissions = permissionMatrix[roleName] || [];
        return permissions.includes('*') || permissions.includes(permission);
    });
};

export default { useIsAdmin, useHasPermission };
