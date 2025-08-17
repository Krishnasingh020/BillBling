'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { autoBillTagging } from '@/ai/flows/bill-tagging';
import type { UserProfile, Bill } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useGroup } from '@/providers/group-provider';
import { useAuth } from '@/providers/auth-provider';

interface AddBillDialogProps {
  members: UserProfile[];
  groupId: string;
  onBillAdded?: (bill: Omit<Bill, 'id' | 'createdAt'>) => void;
}

export function AddBillDialog({ members, groupId, onBillAdded }: AddBillDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paidBy, setPaidBy] = useState<string>('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  
  const currentUserId = user?.uid;

  useEffect(() => {
    if (members.length > 0 && open && currentUserId) {
      setPaidBy(currentUserId);
      setParticipants(members.map(m => m.uid));
    }
  }, [members, open, currentUserId]);


  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDescription(value);
    if (value.length > 5 && !category) { // Only auto-tag if category is not already set
      setIsTagging(true);
      autoBillTagging({ description: value })
        .then(result => {
          setCategory(result.category);
        })
        .catch(err => console.error('AI tagging failed:', err))
        .finally(() => setIsTagging(false));
    }
  };
  
  const handleParticipantChange = (uid: string) => {
    setParticipants(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  }

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setParticipants(members.map(m => m.uid));
    } else {
      setParticipants([]);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !amount || !description || !paidBy || participants.length === 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please fill out all fields and select participants.' });
        return;
    };
    setLoading(true);

    try {
        const newBill: Omit<Bill, 'id' | 'createdAt'> = {
            groupId,
            description,
            amount: parseFloat(amount),
            category: category || 'Other',
            paidBy,
            participants,
        };

        if (onBillAdded) {
            onBillAdded(newBill);
        }
      
      toast({ title: 'Bill added!', description: `${description} for $${amount} has been added.` });
      setOpen(false);
      // Reset form
      setDescription('');
      setAmount('');
      setCategory('');
      if (currentUserId) setPaidBy(currentUserId);
      setParticipants(members.map(m => m.uid));
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not add bill.' });
    } finally {
      setLoading(false);
    }
  };

  const areAllSelected = participants.length === members.length && members.length > 0;
  const areSomeSelected = participants.length > 0 && participants.length < members.length;


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Bill
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add a new bill</DialogTitle>
            <DialogDescription>Enter the details of the expense.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="e.g. Weekly Groceries"
                required
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 75.50"
                required
                step="0.01"
              />
            </div>
            <div className='space-y-2 relative'>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="pr-8"
                  placeholder="e.g. Food (will be auto-tagged)"
                />
                {isTagging && <Loader2 className="absolute right-2 top-8 h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
            <div className="space-y-2">
                <Label>Paid by</Label>
                 <Select value={paidBy} onValueChange={setPaidBy}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select who paid" />
                    </SelectTrigger>
                    <SelectContent>
                        {members.map(member => (
                            <SelectItem key={member.uid} value={member.uid}>{member.displayName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label>Split between</Label>
                <div className='p-3 bg-muted/50 rounded-md max-h-48 overflow-y-auto'>
                    <div className="flex items-center space-x-2 pb-2 border-b mb-2">
                        <Checkbox 
                            id="select-all" 
                            checked={areAllSelected || (areSomeSelected ? 'indeterminate' : false)}
                            onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                        />
                        <Label htmlFor="select-all" className='font-medium'>Select All</Label>
                    </div>
                    <div className="space-y-2">
                        {members.map(member => (
                            <div key={member.uid} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={`participant-${member.uid}`} 
                                    checked={participants.includes(member.uid)}
                                    onCheckedChange={() => handleParticipantChange(member.uid)}
                                />
                                <Label htmlFor={`participant-${member.uid}`}>{member.displayName}</Label>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Bill
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
