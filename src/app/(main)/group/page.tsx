'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function GroupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [loadingJoin, setLoadingJoin] = useState(false);
    const [groupName, setGroupName] = useState('The Fun House');
    const [inviteCode, setInviteCode] = useState('FUN123');

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingCreate(true);
        // Mock creating a group
        setTimeout(() => {
            toast({ title: "Group Created!", description: "You're all set up." });
            router.push('/dashboard');
            setLoadingCreate(false);
        }, 1000);
    };
    
    const handleJoinGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingJoin(true);
        // Mock joining a group
        setTimeout(() => {
             toast({ title: "Joined Group!", description: `Welcome to The Fun House!` });
             router.push('/dashboard');
             setLoadingJoin(false);
        }, 1000);
    };


    return (
        <div className="container mx-auto max-w-lg py-12">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold">Manage Your Group</h1>
                <p className="text-muted-foreground">Authentication is currently disabled for testing.</p>
            </div>
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
