'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, getDocs, query, updateDoc, where, writeBatch } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function GroupPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [loadingJoin, setLoadingJoin] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [inviteCode, setInviteCode] = useState('');

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoadingCreate(true);

        try {
            const newGroupRef = await addDoc(collection(db, "groups"), {
                groupName,
                members: [user.uid],
                inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
                createdAt: new Date(),
            });

            await updateDoc(doc(db, "users", user.uid), {
                groupId: newGroupRef.id
            });
            
            toast({ title: "Group Created!", description: "You're all set up." });
            router.push('/dashboard');

        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: "Could not create group." });
            setLoadingCreate(false);
        }
    };
    
    const handleJoinGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoadingJoin(true);

        try {
            const q = query(collection(db, "groups"), where("inviteCode", "==", inviteCode.trim().toUpperCase()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                toast({ variant: "destructive", title: "Invalid Code", description: "No group found with that invite code." });
                setLoadingJoin(false);
                return;
            }

            const groupDoc = querySnapshot.docs[0];
            const groupData = groupDoc.data();

            if(groupData.members.includes(user.uid)) {
                 toast({ title: "Already a member", description: `You are already in ${groupData.groupName}!` });
                 router.push('/dashboard');
                 return;
            }

            const batch = writeBatch(db);

            const groupRef = doc(db, 'groups', groupDoc.id);
            batch.update(groupRef, {
                members: [...groupData.members, user.uid]
            });

            const userRef = doc(db, 'users', user.uid);
            batch.update(userRef, {
                groupId: groupDoc.id
            });

            await batch.commit();
            
            toast({ title: "Joined Group!", description: `Welcome to ${groupData.groupName}!` });
            router.push('/dashboard');

        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: "Could not join group." });
            setLoadingJoin(false);
        }
    };


    return (
        <div className="container mx-auto max-w-lg py-12">
            <Tabs defaultValue="create" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="create">Create Group</TabsTrigger>
                    <TabsTrigger value="join">Join Group</TabsTrigger>
                </TabsList>
                <TabsContent value="create">
                    <Card>
                        <form onSubmit={handleCreateGroup}>
                            <CardHeader>
                                <CardTitle>Create a new group</CardTitle>
                                <CardDescription>Set up a new home for you and your flatmates.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="group-name">Group Name</Label>
                                    <Input id="group-name" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. The Fun House" required />
                                </div>
                            </CardContent>
                             <CardFooter>
                                <Button type="submit" disabled={loadingCreate} className="w-full">
                                    {loadingCreate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Group
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
                <TabsContent value="join">
                    <Card>
                         <form onSubmit={handleJoinGroup}>
                            <CardHeader>
                                <CardTitle>Join an existing group</CardTitle>
                                <CardDescription>Enter an invite code from one of your flatmates.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="invite-code">Invite Code</Label>
                                    <Input id="invite-code" value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="e.g. A1B2C3" required />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={loadingJoin} className="w-full">
                                     {loadingJoin && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Join Group
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
