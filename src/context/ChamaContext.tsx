"use client";

import { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { Chama, Membership, MembershipRole } from '@/types/api';
import { useGetChamas } from '@/hooks/useChamas';
import { useSession } from 'next-auth/react';

interface ChamaContextType {
  activeChama: Chama | null;
  setActiveChamaId: (id: string) => void;
  chamas: Chama[];
  isLoading: boolean;
  currentUserMembership: Membership | null;
  isPrivileged: boolean;
  canBroadCast: boolean;
  resetToDefaultChama: () => void;
}

const ChamaContext = createContext<ChamaContextType | undefined>(undefined);

export function ChamaProvider({ children }: { children: ReactNode }) {
  const [activeChamaId, setActiveChamaId] = useState<string | null>(null);
  const { data: session } = useSession();
  const { data: chamas = [], isLoading } = useGetChamas();

  const defaultChama = useMemo(() => {
    if (chamas.length === 0 || !session?.user) return null;
    
    const privilegedChama = chamas.find(chama => 
        chama.members.some(m => m.user.id === session.user.id && ['ADMIN', 'TREASURER', 'SECRETARY'].includes(m.role))
    );
    return privilegedChama || chamas[0];
  }, [chamas, session]);

  useEffect(() => {
    if (!activeChamaId && defaultChama) {
      setActiveChamaId(defaultChama.id);
    }
  }, [chamas, activeChamaId, defaultChama]);

  const activeChama = useMemo(() => {
      return chamas.find(c => c.id === activeChamaId) || null;
  }, [chamas, activeChamaId]);
  
  const currentUserMembership = useMemo(() => {
    if (!activeChama || !session?.user) return null;
    return activeChama.members.find(m => m.user.id === session.user.id) || null;
  }, [activeChama, session]);

  const isPrivileged = useMemo(() => {
      const privilegedRoles: MembershipRole[] = ['ADMIN', 'TREASURER', 'SECRETARY'];
      return !!currentUserMembership && privilegedRoles.includes(currentUserMembership.role);
  }, [currentUserMembership]);

 const canBroadCast = useMemo(() => {
    return !!currentUserMembership && ['ADMIN', 'SECRETARY'].includes(currentUserMembership.role);
  }, [currentUserMembership]); 


  const handleSelectChama = (id: string) => {
    setActiveChamaId(id);
  };
  
  const resetToDefaultChama = useCallback(() => {
    if (defaultChama) {
        setActiveChamaId(defaultChama.id);
    }
  }, [defaultChama]);

  const value = {
    activeChama,
    setActiveChamaId: handleSelectChama,
    chamas,
    isLoading,
    currentUserMembership,
    isPrivileged,
    resetToDefaultChama,
    canBroadCast
  };

  return (
      <ChamaContext.Provider value={value}>
          {children}
      </ChamaContext.Provider>
  );
}

export function useChamaContext() {
  const context = useContext(ChamaContext);
  if (context === undefined) {
    throw new Error('useChamaContext must be used within a ChamaProvider');
  }
  return context;
}