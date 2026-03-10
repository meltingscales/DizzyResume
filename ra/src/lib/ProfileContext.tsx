import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from './api';
import type { Profile } from '../types';

interface ProfileContextValue {
  profiles: Profile[];
  activeProfile: Profile | null;
  setActiveProfileId: (id: string) => void;
  refreshProfiles: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue>({
  profiles: [],
  activeProfile: null,
  setActiveProfileId: () => {},
  refreshProfiles: async () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(null);

  const refreshProfiles = async () => {
    const list = await api.profiles.list();
    setProfiles(list);
    setActiveProfileIdState((prev) => {
      if (prev && list.find((p) => p.id === prev)) return prev;
      return list[0]?.id ?? null;
    });
  };

  useEffect(() => {
    refreshProfiles().catch(console.error);
  }, []);

  const setActiveProfileId = (id: string) => setActiveProfileIdState(id);
  const activeProfile = profiles.find((p) => p.id === activeProfileId) ?? null;

  return (
    <ProfileContext.Provider value={{ profiles, activeProfile, setActiveProfileId, refreshProfiles }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
