import { getDashboardData, getUserAccounts } from "@/action/dashboard";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import React, { Suspense } from "react";
import AccountCard from "./_components/account-card";
import { getCurrentBudget } from "@/action/budget";
import BudgetProgress from "./_components/budget-progress";
import TransactionOverview from "./_components/transaction-overview";

async function DashboardPage() {
  const accounts = await getUserAccounts();

  const defaultAccount = accounts?.find((account) => account.isDefault);
  let budgetData = null;

  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  const transactions = await getDashboardData();
  // console.log(budgetData,accounts,"kjsdjkj")
  return (
    <div className="space-y-8">
      {/* budget Progess */}
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses || 0}
        />
      )}
      {/* Overview Dashboard */}

      <Suspense fallback={"loading Overview...."}>
        <TransactionOverview accounts={accounts} transactions={transactions} />
      </Suspense>

      {/* Account Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed  bg-blue-50 mb-4">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2 text-blue-500 dark:text-white" />
              <p className="text-sm font-medium text-slate-700">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {accounts.length > 0 &&
          accounts.map((account) => {
            return <AccountCard key={account.id} account={account} />;
          })}
      </div>
    </div>
  );
}

export default DashboardPage;
