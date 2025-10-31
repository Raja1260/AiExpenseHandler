import { getAccountWithTransactions } from "@/action/account";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";
import TransactionTable from "../_components/transaction-table";
import { BarLoader } from "react-spinners";
import AccountChartPage from "../_components/account-chart";

const AccountPage = async ({ params }) => {
  const accountData = await getAccountWithTransactions(params.id);
  if (!accountData) {
    notFound();
  }
  const { transactions, ...account } = accountData;
  return (
    <div className="space-y-8 px-5 mt-40">
      <div className="flex gap-4 items-end justify-between">
        <div>
          <h6 className="text-4xl sm:text-5xl font-bold tracking-tight gradient-title capitalize">
            {account.name}
          </h6>
          <p className="text-muted-foreground text-slate-600">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
            Account
          </p>
        </div>
        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold">
            ₹{parseFloat(account.balance).toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground text-slate-600">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>
      {/* Chart section  */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <AccountChartPage transactions={transactions} />
      </Suspense>

      {/* Transaction Table */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <TransactionTable transactions={transactions} />
      </Suspense>
    </div>
  );
};

export default AccountPage;
