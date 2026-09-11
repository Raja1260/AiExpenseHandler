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
import { ArrowDownRight, ArrowUpRight, History, PieChart as PieChartIcon, Receipt } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { categoryColors, defaultCategories } from "@/data/categories";

const FALLBACK_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#D4A5A5",
  "#9FA8DA",
];

const getCategoryLabel = (categoryId) =>
  defaultCategories.find((c) => c.id === categoryId)?.name ||
  (categoryId?.charAt(0).toUpperCase() + categoryId?.slice(1));

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-sm shadow-lg backdrop-blur">
      <p className="font-medium text-slate-700">{getCategoryLabel(name)}</p>
      <p className="text-slate-500">₹{value.toFixed(2)}</p>
    </div>
  );
};

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

  const pieChartData = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({
      name: category,
      value: amount,
    }))
    .sort((a, b) => b.value - a.value);

  const totalExpenses = pieChartData.reduce((sum, d) => sum + d.value, 0);

  //   console.log("recentTransaction", recentTransaction);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Recent Transactions */}
      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/60 shadow-sm transition-shadow hover:shadow-lg dark:border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-inner">
              <History className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold tracking-tight text-slate-700 dark:text-slate-200">
              Recent Transactions
            </CardTitle>
          </div>

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
          <div className="space-y-1.5">
            {recentTransaction.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <Receipt className="h-8 w-8 text-slate-300" />
                <p className="text-sm">No recent transactions</p>
              </div>
            ) : (
              recentTransaction.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-xl px-2 py-2 transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          categoryColors[transaction.category] || "#94a3b8",
                      }}
                    />
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {transaction.description || "Untitled Transaction"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getCategoryLabel(transaction.category)} ·{" "}
                        {format(new Date(transaction.date), "PP")}
                      </p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold",
                      transaction.type === "EXPENSE"
                        ? "bg-red-50 text-red-500"
                        : "bg-green-50 text-green-600"
                    )}
                  >
                    {transaction.type === "EXPENSE" ? (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5" />
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
      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/60 shadow-sm transition-shadow hover:shadow-lg dark:border-slate-700">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-inner">
            <PieChartIcon className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-semibold tracking-tight text-slate-700 dark:text-slate-200">
            Monthly Expense Breakdown
          </CardTitle>
        </CardHeader>

        <CardContent className="pb-5">
          {pieChartData.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <PieChartIcon className="h-8 w-8 text-slate-300" />
              <p className="text-sm">No expenses this month</p>
            </div>
          ) : (
            <>
              <div className="relative h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={
                            categoryColors[entry.name] ||
                            FALLBACK_COLORS[index % FALLBACK_COLORS.length]
                          }
                          className="transition-opacity duration-300 hover:opacity-80"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    ₹{totalExpenses.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
                {pieChartData.map((entry, index) => (
                  <div
                    key={entry.name}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          categoryColors[entry.name] ||
                          FALLBACK_COLORS[index % FALLBACK_COLORS.length],
                      }}
                    />
                    <span className="truncate text-slate-600 dark:text-slate-300">
                      {getCategoryLabel(entry.name)}
                    </span>
                    <span className="ml-auto shrink-0 font-medium text-slate-500">
                      {((entry.value / totalExpenses) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionOverview;
