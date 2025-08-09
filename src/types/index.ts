import type { Timestamp } from 'firebase/firestore';

export type UserProfile = {
    uid: string;
    displayName: string;
    email: string;
    groupId: string | null;
};

export type Group = {
    id: string;
    groupName: string;
    members: string[]; // array of user uids
    inviteCode: string;
    createdAt: Timestamp;
};

export type Bill = {
    id:string;
    groupId: string;
    description: string;
    amount: number;
    paidBy: string; // user uid
    participants: string[]; // array of user uids
    category?: string;
    isSettlement?: boolean;
    createdAt: Timestamp;
};

export type Balance = {
    user: UserProfile;
    amount: number;
    type: 'owes_me' | 'i_owe' | 'owes_to_group' | 'owed_by_group';
};
