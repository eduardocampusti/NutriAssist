import React from 'react';
import { AuthProvider } from './AuthContext';
import { ToastProvider } from './ToastContext';
import { UserProvider } from './UserContext';
import { SchoolProvider } from './SchoolContext';
import { InventoryProvider } from './InventoryContext';
import { MenuProvider } from './MenuContext';
import { DocumentProvider } from './DocumentContext';
import { NutritionProvider } from './NutritionContext';
import { PNAEProvider } from './PNAEContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <ToastProvider>
            <AuthProvider>
                <DocumentProvider>
                    <UserProvider>
                        <SchoolProvider>
                            <InventoryProvider>
                                <MenuProvider>
                                    <NutritionProvider>
                                        <PNAEProvider>
                                            {children}
                                        </PNAEProvider>
                                    </NutritionProvider>
                                </MenuProvider>
                            </InventoryProvider>
                        </SchoolProvider>
                    </UserProvider>
                </DocumentProvider>
            </AuthProvider>
        </ToastProvider>
    );
};
