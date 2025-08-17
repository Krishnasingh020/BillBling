
"use client";

import type { Group, UserProfile, Bill } from "@/types";
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useMemo,
  useEffect,
} from "react";
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from "./auth-provider";


// Mock Data
const MOCK_OTHER_USERS: Omit<UserProfile, 'groupId'>[] = [
  { uid: 'user-2', displayName: 'Beth', email: 'beth@example.com' },
  { uid: 'user-3', displayName: 'Charlie', email: 'charlie@example.com' },
  { uid: 'user-4', displayName: 'David', email: 'david@example.com' },
];


const MOCK_EXISTING_GROUP_ID = 'group-1';

const initialMockBills: Omit<Bill, 'id' | 'createdAt' | 'groupId'>[] = [
  { description: 'Monthly Rent', amount: 1200, paidBy: 'user-1', participants: ['user-1', 'user-2', 'user-3', 'user-4'], category: 'Rent' },
  { description: 'Internet Bill', amount: 60, paidBy: 'user-2', participants: ['user-1', 'user-2', 'user-3', 'user-4'], category: 'Internet' },
  { description: 'Groceries', amount: 150, paidBy: 'user-3', participants: ['user-1', 'user-2', 'user-3', 'user-4'], category: 'Groceries' },
  { description: 'Electricity', amount: 85, paidBy: 'user-1', participants: ['user-1', 'user-2', 'user-3', 'user-4'], category: 'Utilities' },
  { description: 'Dinner Out', amount: 90, paidBy: 'user-2', participants: ['user-1', 'user-2'], category: 'Food' },
  { description: 'Weekend Trip Gas', amount: 50, paidBy: 'user-2', participants: ['user-1', 'user-2'], category: 'Travel' },
];

const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}


type GroupContextType = {
  group: Group | null;
  members: UserProfile[];
  bills: Bill[];
  createGroup: (groupName: string) => Group;
  joinGroup: (inviteCode: string) => Group | null;
  addBill: (bill: Omit<Bill, 'id' | 'createdAt'>) => void;
};

const GroupContext = createContext<GroupContextType | null>(null);

const MOCK_EXISTING_INVITE_CODE = 'FUN123';

// Pre-generate mock bills to avoid re-calculating on each render
const MOCK_BILLS: Bill[] = initialMockBills.map((bill, index) => ({
    ...bill,
    // Note: The first mock user in joinGroup will be user-1
    groupId: MOCK_EXISTING_GROUP_ID,
    id: uuidv4(),
    // @ts-ignore
    createdAt: { toDate: () => new Date(Date.now() - index * 24 * 60 * 60 * 1000) },
}));


export const GroupProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  
  const createGroup = (groupName: string) => {
    if (!user) throw new Error("User must be authenticated to create a group.");

    const currentUserProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || 'Anonymous',
        email: user.email || '',
        groupId: null,
    };

    const newGroupId = uuidv4();
    const newGroup: Group = {
        id: newGroupId,
        groupName,
        members: [user.uid],
        inviteCode: generateInviteCode(),
        // @ts-ignore
        createdAt: { toDate: () => new Date() },
    };
    
    currentUserProfile.groupId = newGroupId;

    setGroup(newGroup);
    setMembers([currentUserProfile]);
    setBills([]); // Start with no bills for a new group
    return newGroup;
  }
  
  const joinGroup = (inviteCode: string) => {
    if (!user) throw new Error("User must be authenticated to join a group.");
    
    // For this mock, we only have one joinable group
    if (inviteCode === MOCK_EXISTING_INVITE_CODE) {
        
        const currentUserAsMember1: UserProfile = {
            uid: 'user-1', // Overwrite current auth user to match mock data
            displayName: user.displayName || 'Anonymous',
            email: user.email || '',
            groupId: MOCK_EXISTING_GROUP_ID,
        };

        const allMembers: UserProfile[] = [
            currentUserAsMember1,
            ...MOCK_OTHER_USERS.map(u => ({ ...u, groupId: MOCK_EXISTING_GROUP_ID }))
        ];

        const existingGroup: Group = {
            id: MOCK_EXISTING_GROUP_ID,
            groupName: 'The Fun House',
            members: allMembers.map(m => m.uid),
            inviteCode: MOCK_EXISTING_INVITE_CODE,
            // @ts-ignore
            createdAt: { toDate: () => new Date() }
        }
        setGroup(existingGroup);
        setMembers(allMembers);
        setBills(MOCK_BILLS);
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
    group,
    members,
    bills,
    createGroup,
    joinGroup,
    addBill,
  }), [group, members, bills]);

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
