"use client";

import type { Group, UserProfile, Bill } from "@/types";
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useMemo,
} from "react";
import { v4 as uuidv4 } from 'uuid';

// Mock Data
const mockUsers: UserProfile[] = [
  { uid: 'user-1', displayName: 'Alex', email: 'alex@example.com', groupId: 'group-1' },
  { uid: 'user-2', displayName: 'Beth', email: 'beth@example.com', groupId: 'group-1' },
  { uid: 'user-3', displayName: 'Charlie', email: 'charlie@example.com', groupId: 'group-1' },
  { uid: 'user-4', displayName: 'David', email: 'david@example.com', groupId: 'group-1' },
];

const mockCurrentUser = mockUsers[0];

const initialMockBills: Omit<Bill, 'id' | 'createdAt'>[] = [
  { groupId: 'group-1', description: 'Monthly Rent', amount: 1200, paidBy: 'user-1', participants: ['user-1', 'user-2', 'user-3', 'user-4'], category: 'Rent' },
  { groupId: 'group-1', description: 'Internet Bill', amount: 60, paidBy: 'user-2', participants: ['user-1', 'user-2', 'user-3', 'user-4'], category: 'Internet' },
  { groupId: 'group-1', description: 'Groceries', amount: 150, paidBy: 'user-3', participants: ['user-1', 'user-2', 'user-3', 'user-4'], category: 'Groceries' },
  { groupId: 'group-1', description: 'Electricity', amount: 85, paidBy: 'user-1', participants: ['user-1', 'user-2', 'user-3', 'user-4'], category: 'Utilities' },
  { groupId: 'group-1', description: 'Dinner Out', amount: 90, paidBy: 'user-2', participants: ['user-1', 'user-2'], category: 'Food' },
  { groupId: 'group-1', description: 'Weekend Trip Gas', amount: 50, paidBy: 'user-2', participants: ['user-1', 'user-2'], category: 'Travel' },
];

const generateMockBills = (groupId: string): Bill[] => {
    return initialMockBills.map((bill, index) => ({
        ...bill,
        groupId,
        id: uuidv4(),
        // @ts-ignore
        createdAt: { toDate: () => new Date(Date.now() - index * 24 * 60 * 60 * 1000) },
    }));
};

const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}


type GroupContextType = {
  user: UserProfile;
  group: Group | null;
  members: UserProfile[];
  bills: Bill[];
  createGroup: (groupName: string) => Group;
  joinGroup: (inviteCode: string) => Group | null;
  addBill: (bill: Omit<Bill, 'id' | 'createdAt'>) => void;
};

const GroupContext = createContext<GroupContextType | null>(null);

const MOCK_EXISTING_GROUP_ID = 'group-1';
const MOCK_EXISTING_INVITE_CODE = 'FUN123';

export const GroupProvider = ({ children }: { children: ReactNode }) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const user = mockCurrentUser;

  const createGroup = (groupName: string) => {
    const newGroupId = uuidv4();
    const newGroup: Group = {
        id: newGroupId,
        groupName,
        members: [user.uid],
        inviteCode: generateInviteCode(),
        // @ts-ignore
        createdAt: { toDate: () => new Date() },
    };
    setGroup(newGroup);
    setMembers([user]);
    setBills([]); // Start with no bills for a new group
    return newGroup;
  }
  
  const joinGroup = (inviteCode: string) => {
    // For this mock, we only have one joinable group
    if (inviteCode === MOCK_EXISTING_INVITE_CODE) {
        const existingGroup: Group = {
            id: MOCK_EXISTING_GROUP_ID,
            groupName: 'The Fun House',
            members: mockUsers.map(u => u.uid),
            inviteCode: MOCK_EXISTING_INVITE_CODE,
            // @ts-ignore
            createdAt: { toDate: () => new Date() }
        }
        setGroup(existingGroup);
        setMembers(mockUsers);
        setBills(generateMockBills(existingGroup.id));
        return existingGroup;
    }
    return null;
  }

  const addBill = (newBillData: Omit<Bill, 'id' | 'createdAt'>) => {
    const newBill: Bill = {
        ...newBillData,
        id: uuidv4(),
        // @ts-ignore
        createdAt: { toDate: () => new Date() },
    };
    setBills(prevBills => [newBill, ...prevBills]);
  }


  const value = useMemo(() => ({
    user,
    group,
    members,
    bills,
    createGroup,
    joinGroup,
    addBill,
  }), [user, group, members, bills]);

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (context === null) {
    throw new Error("useGroup must be used within a GroupProvider");
  }
  return context;
};
