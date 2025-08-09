'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type Bill } from '@/types';

interface SpendingChartProps {
  bills: Bill[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff4d4d', '#4ddbff'];

export function SpendingChart({ bills }: SpendingChartProps) {
  const chartData = useMemo(() => {
    if (!bills || bills.length === 0) return [];

    const spendingByCategory: { [category: string]: number } = {};
    bills.forEach(bill => {
      const category = bill.category || 'Other';
      spendingByCategory[category] = (spendingByCategory[category] || 0) + bill.amount;
    });

    return Object.entries(spendingByCategory).map(([name, value]) => ({ name, value }));
  }, [bills]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No spending data to display.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
            <PieChart>
            <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
                {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            <Legend />
            </PieChart>
        </ResponsiveContainer>
    </div>
  );
}
