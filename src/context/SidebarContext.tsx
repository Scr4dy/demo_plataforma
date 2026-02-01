import React, { createContext, useContext } from 'react';

type SidebarContextType = {
  isSidebarOpen: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
} | undefined;

const SidebarContext = createContext<SidebarContextType>(undefined);

export const useSidebar = () => useContext(SidebarContext) as SidebarContextType | null;

export default SidebarContext;
