'use client';

import type { Group, UserProfile, Bill } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { useAuth } from './auth-provider';
import { v4 as uuidv4 } from 'uuid';

const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

type GroupContextType = {
  group: Group | null;
  members: UserProfile[];
  bills: Bill[];
  loading: boolean;
  createGroup: (groupName: string) => Promise<void>;
  joinGroup: (inviteCode: string) => Promise<Group | null>;
  addBill: (bill: Omit<Bill, 'id' | 'createdAt'>) => Promise<void>;
};

const GroupContext = createContext<GroupContextType | null>(null);

export const GroupProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  
  const [users, setUsers] = useLocalStorage<UserProfile[]>('users', []);
  const [groups, setGroups] = useLocalStorage<Group[]>('groups', []);
  const [allBills, setAllBills] = useLocalStorage<Bill[]>('bills', []);

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const userProfile = user ? users.find(u => u.uid === user.uid) : null;

  const fetchGroupData = useCallback(async (groupId: string) => {
    setLoading(true);
    
    const currentGroup = groups.find(g => g.id === groupId) || null;
    setGroup(currentGroup);

    if (currentGroup) {
      const groupMembers = users.filter(u => u.groupId === groupId);
      setMembers(groupMembers);

      const groupBills = allBills.filter(b => b.groupId === groupId);
      setBills(groupBills.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } else {
      setGroup(null);
      setMembers([]);
      setBills([]);
    }
    
    setLoading(false);
  }, [groups, users, allBills]);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (userProfile?.groupId) {
      fetchGroupData(userProfile.groupId);
    } else {
      setLoading(false);
      setGroup(null);
      setMembers([]);
      setBills([]);
    }
  }, [userProfile, authLoading, fetchGroupData]);

  const createGroup = async (groupName: string) => {
    if (!user) throw new Error('User must be authenticated.');
    setLoading(true);

    const newGroupId = uuidv4();
    const newGroup: Group = {
      id: newGroupId,
      groupName,
      members: [user.uid],
      inviteCode: generateInviteCode(),
      createdAt: new Date().toISOString(),
    };
    
    setGroups([...groups, newGroup]);
    setUsers(users.map(u => u.uid === user.uid ? { ...u, groupId: newGroupId } : u));
  };
  
  const joinGroup = async (inviteCode: string) => {
    if (!user) throw new Error('User must be authenticated.');
    setLoading(true);

    const groupToJoin = groups.find(g => g.inviteCode === inviteCode);

    if (groupToJoin) {
      // Add user to group's member list
      const updatedGroup = {
        ...groupToJoin,
        members: [...groupToJoin.members, user.uid],
      };
      setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g));
      
      // Update user's groupId
      setUsers(users.map(u => u.uid === user.uid ? { ...u, groupId: groupToJoin.id } : u));
      
      return updatedGroup;
    } else {
      setLoading(false);
      return null;
    }
  };

  const addBill = async (newBillData: Omit<Bill, 'id' | 'createdAt'>) => {
      const newBill: Bill = {
        ...newBillData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      setAllBills([...allBills, newBill]);
  };

  return (
    <GroupContext.Provider value={{ group, members, bills, loading, createGroup, joinGroup, addBill }}>
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (context === null) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
};
