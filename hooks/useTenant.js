'use client';
import { createContext, useContext } from 'react';

const TenantContext = createContext(null);

export function TenantProvider({ children, tenant }) {
  return <TenantContext.Provider value={tenant}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const tenant = useContext(TenantContext);
  if (!tenant) throw new Error('useTenant must be within TenantProvider');
  return tenant;
}
