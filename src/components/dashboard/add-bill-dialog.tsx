'use client';
import { useState } from 'react';
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
import { useAuth } from '@/providers/auth-provider';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { autoBillTagging } from '@/ai/flows/bill-tagging';
import type { UserProfile } from '@/types';

interface AddBillDialogProps {
  members: UserProfile[];
  groupId: string;
}

export function AddBillDialog({ members, groupId }: AddBillDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTagging, setIsTagging] = useState(false);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDescription(value);
    if (value.length > 5) {
      setIsTagging(true);
      autoBillTagging({ description: value })
        .then(result => {
          setCategory(result.category);
        })
        .catch(err => console.error('AI tagging failed:', err))
        .finally(() => setIsTagging(false));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !groupId || !amount || !description) return;
    setLoading(true);

    try {
      await addDoc(collection(db, 'bills'), {
        groupId,
        description,
        amount: parseFloat(amount),
        category: category || 'Other',
        paidBy: user.uid,
        participants: members.map(m => m.uid),
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Bill added!', description: `${description} for $${amount} has been added.` });
      setOpen(false);
      setDescription('');
      setAmount('');
      setCategory('');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not add bill.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Bill
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add a new bill</DialogTitle>
            <DialogDescription>Enter the details of the expense. It will be split equally among all group members.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                className="col-span-3"
                placeholder="e.g. Weekly Groceries"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
                placeholder="e.g. 75.50"
                required
                step="0.01"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <div className='col-span-3 relative'>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="pr-8"
                  placeholder="e.g. Food"
                />
                {isTagging && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
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
