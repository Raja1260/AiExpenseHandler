"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
  "#9FA8DA",
];

const TransactionOverview = ({ accounts, transactions }) => {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id
  );
  const accountTransaction = transactions.filter(
    (t) => t.accountId === selectedAccountId
  );
  const recentTransaction = accountTransaction
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const currentDate = new Date();
  const currentMonthExpenses = accountTransaction.filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      t.type === "EXPENSE" &&
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });
  const expensesByCategory = currentMonthExpenses.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += transaction.amount;
    return acc;
  }, {});

  const pieChartData = Object.entries(expensesByCategory).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    })
  );

  //   console.log("recentTransaction", recentTransaction);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Recent Transactions */}
      <Card className="border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow rounded-2xl">
        <CardHeader className="flex items-center justify-between pb-4 flex-row">
          <CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-200 tracking-tight">
            Recent Transactions
          </CardTitle>

          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
          >
            <SelectTrigger className="w-[160px] rounded-lg border-slate-300 dark:border-slate-600">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent className="rounded-lg shadow-lg">
              {accounts.map((account) => (
                <SelectItem value={account.id} key={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {recentTransaction.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No recent transactions
              </p>
            ) : (
              recentTransaction.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {transaction.description || "Untitled Transaction"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transaction.date), "PP")}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "flex items-center font-medium",
                      transaction.type === "EXPENSE"
                        ? "text-red-500"
                        : "text-green-500"
                    )}
                  >
                    {transaction.type === "EXPENSE" ? (
                      <ArrowDownRight className="mr-1 h-5 w-5" />
                    ) : (
                      <ArrowUpRight className="mr-1 h-5 w-5" />
                    )}
                    ₹{transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Expense Breakdown */}
      <Card className="border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-200 tracking-tight">
            Monthly Expense Breakdown
          </CardTitle>
        </CardHeader>

        <CardContent className="pb-5">
          {" "}
          {/* 👈 reverted padding back */}
          {pieChartData.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No expenses this month
            </p>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ₹${value.toFixed(2)}`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        className="transition-all duration-300 hover:opacity-80"
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => `₹${value.toFixed(2)}`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionOverview;
