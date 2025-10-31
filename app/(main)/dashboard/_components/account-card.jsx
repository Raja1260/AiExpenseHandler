"use client";
import React, { useEffect } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import useFetch from "@/hooks/use-fetch";
import { updateDefaultAccount } from "@/action/account";
import { toast } from "sonner";

const AccountCard = ({ account }) => {
  const { name, type, balance, id, isDefault } = account;
  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    error,
    data: updateAccount,
  } = useFetch(updateDefaultAccount);
  const handleDefaultChange = async (event) => {
    event.preventDefault();
    if (isDefault) {
      toast.warning("You need atleast one default account");
      return;
    }
    await updateDefaultFn(id);
  };
  useEffect(() => {
    if (updateAccount?.success) {
      toast.success("Default account update Successfully");
    }
  }, [updateAccount, updateDefaultLoading]);
  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);
  return (
    <Card className="hover:shadow-md transition-shadow group relative bg-blue-50 mb-4">
      <Link href={`/account/${id}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium capitalize  text-slate-700">
            {name}
          </CardTitle>
          <Switch
            onClick={handleDefaultChange}
            disabled={updateDefaultLoading}
            checked={isDefault}
            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-slate-300"
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            ₹{parseFloat(balance).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground capitalize  text-slate-700">
            {" "}
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <ArrowUpRight className="mr-1 h-5 w-5 text-green-500" />
            Income
          </div>
          <div className="flex items-center">
            <ArrowDownRight className="mr-1 h-5 w-5 text-red-500" />
            Expense
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default AccountCard;
