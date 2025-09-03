import { getUserAccounts } from "@/action/dashboard";
import React from "react";
import TransactionForm from "../components/transaction-form";
import { defaultCategories } from "@/data/categories";
import { getTransaction } from "@/action/transaction";

const AddTransactionPage = async ({ searchParams }) => {
  const accounts = await getUserAccounts();
  const editId = searchParams.edit;
  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }
  return (
    <div className="mt-40 max-w-3xl mx-auto px-5">
      <h1 className="text-5xl gradient-title mb-8">{editId ? "Update Transaction": "Add Transaction"}</h1>
      <TransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  );
};

export default AddTransactionPage;
