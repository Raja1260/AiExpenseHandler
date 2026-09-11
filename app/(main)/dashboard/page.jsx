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
          <Card className="group mb-4 cursor-pointer border-2 border-dashed border-blue-200 bg-blue-50/40 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg">
            <CardContent className="flex h-full flex-col items-center justify-center gap-2 pt-5 text-muted-foreground">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-500 transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white">
                <Plus className="h-6 w-6" />
              </div>
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
