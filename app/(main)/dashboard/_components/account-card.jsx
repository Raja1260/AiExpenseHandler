"use client";
import React, { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Landmark,
  Star,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import useFetch from "@/hooks/use-fetch";
import { updateDefaultAccount, deleteAccount } from "@/action/account";
import { toast } from "sonner";

const AccountCard = ({ account }) => {
  const { name, type, balance, id, isDefault } = account;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    error,
    data: updateAccount,
  } = useFetch(updateDefaultAccount);
  const {
    loading: deleteLoading,
    fn: deleteAccountFn,
    error: deleteError,
    data: deletedAccount,
  } = useFetch(deleteAccount);
  const handleDefaultChange = async (event) => {
    event.preventDefault();
    if (isDefault) {
      toast.warning("You need atleast one default account");
      return;
    }
    await updateDefaultFn(id);
  };
  const handleDeleteClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setShowDeleteDialog(true);
  };
  const handleConfirmDelete = async () => {
    await deleteAccountFn(id);
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
  useEffect(() => {
    if (deletedAccount?.success) {
      toast.success("Account deleted successfully");
      setShowDeleteDialog(false);
    } else if (deletedAccount?.success === false) {
      toast.error(deletedAccount.error || "Failed to delete account");
    }
  }, [deletedAccount]);
  useEffect(() => {
    if (deleteError) {
      toast.error(deleteError.message || "Failed to delete account");
    }
  }, [deleteError]);
  const isSavings = type?.toUpperCase() === "SAVINGS";

  return (
    <Card className="group relative mb-4 overflow-hidden border border-blue-100/60 bg-gradient-to-br from-white via-white to-blue-50/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
      {/* Accent glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-400/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

      {isDefault && (
        <div className="absolute right-3 top-2 z-10 flex items-center gap-1 rounded-full bg-blue-600/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
          <Star className="h-2.5 w-2.5 fill-white" />
          Default
        </div>
      )}

      <Link href={`/account/${id}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-inner">
              {isSavings ? (
                <Landmark className="h-5 w-5" />
              ) : (
                <Wallet className="h-5 w-5" />
              )}
            </div>
            <CardTitle className="text-sm font-semibold capitalize text-slate-800">
              {name}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            <Switch
              onClick={handleDefaultChange}
              disabled={updateDefaultLoading}
              checked={isDefault}
              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-slate-300"
            />
            <button
              onClick={handleDeleteClick}
              disabled={deleteLoading}
              title="Delete account"
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-300 opacity-0 transition-all duration-200 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 disabled:opacity-50"
            >
              {deleteLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight text-slate-900">
            ₹
            {parseFloat(balance).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <p className="mt-1 text-xs font-medium capitalize text-slate-500">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-blue-100/70 pt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-50">
              <ArrowUpRight className="h-3.5 w-3.5 text-green-500" />
            </span>
            Income
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50">
              <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
            </span>
            Expense
          </div>
        </CardFooter>
      </Link>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 sm:mx-0">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle className="mt-3">Delete &quot;{name}&quot;?</DialogTitle>
            <DialogDescription>
              This will also delete all of its transactions. This action
              cannot be reverted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AccountCard;
