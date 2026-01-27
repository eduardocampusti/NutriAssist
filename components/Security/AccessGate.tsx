
import React from 'react';
import { useUsers } from '../../contexts/UserContext';
import { Permission, hasPermission } from '../../utils/permissions';

interface AccessGateProps {
    permission: Permission;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const AccessGate: React.FC<AccessGateProps> = ({ permission, children, fallback = null }) => {
    const { activeProfile } = useUsers();

    if (!activeProfile || !hasPermission(activeProfile.role, permission)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
