'use client';

import type { UserProfile } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
  signup: (name: string, email: string) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  signup: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useLocalStorage<UserProfile[]>('users', []);
  const [currentUser, setCurrentUser] = useLocalStorage<UserProfile | null>('currentUser', null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [currentUser]);

  const login = (email: string) => {
    const userToLogin = users.find(u => u.email === email);
    if (userToLogin) {
      setCurrentUser(userToLogin);
    } else {
      throw new Error('User not found');
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const signup = (displayName: string, email: string) => {
    if (users.some(u => u.email === email)) {
        throw new Error('User with this email already exists');
    }
    const newUser: UserProfile = {
      uid: uuidv4(),
      displayName,
      email,
      groupId: null,
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
  };
  
  return (
    <AuthContext.Provider value={{ user: currentUser, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
