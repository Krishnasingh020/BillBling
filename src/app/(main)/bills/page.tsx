'use client';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import type { Bill } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useGroup } from '@/providers/group-provider';
import { Loader2 } from 'lucide-react';

export default function AllBillsPage() {
    const { bills, members, loading } = useGroup();
    const [searchTerm, setSearchTerm] = useState('');

    const getPayerName = (uid: string) => members.find(m => m.uid === uid)?.displayName || 'Unknown';

    const filteredBills = useMemo(() => {
        return bills.filter(bill =>
            bill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (bill.category && bill.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
            getPayerName(bill.paidBy).toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [bills, searchTerm, members]);

    if (loading) {
        return (
            <div className="container mx-auto p-4 md:p-6 lg:p-8 text-center flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <p>Loading bills...</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>All Bills</CardTitle>
                    <CardDescription>A complete history of all your group's expenses.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input
                            placeholder="Search bills..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Paid By</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBills.map(bill => (
                                <TableRow key={bill.id}>
                                    <TableCell>{bill.createdAt ? format(new Date(bill.createdAt), 'MMM d, yyyy') : '...'}</TableCell>
                                    <TableCell className="font-medium">{bill.description}</TableCell>
                                    <TableCell>{getPayerName(bill.paidBy)}</TableCell>
                                    <TableCell>
                                        {bill.category && <Badge variant="secondary">{bill.category}</Badge>}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">${bill.amount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {filteredBills.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>No bills found. Add one from the dashboard!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
