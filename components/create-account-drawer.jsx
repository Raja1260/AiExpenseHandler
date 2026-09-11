"use client";
import React, { useEffect, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { accountSchema } from "@/app/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";
import { Button } from "./ui/button";
import useFetch from "@/hooks/use-fetch";
import { createAccount } from "@/action/dashboard";
import { Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";

function CreateAccountDrawer({ children }) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  const {
    data: newAccount,
    fn: createAccountFn,
    error,
    loading: createAccountLoading,
  } = useFetch(createAccount);

  useEffect(() => {
    if(newAccount && !createAccountLoading) {
      toast.success("Account Created Successfully");
      setOpen(false)
      reset()
    }
  },[newAccount,createAccountLoading]);
  useEffect(() => {
    if(error){
      toast.error(error.message || "Failed to create account");
    }
  },[error])

  const onSubmit = async (data) => {
    await createAccountFn(data);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="mx-auto w-full sm:max-w-md">
        <DrawerHeader className="items-center text-center sm:text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-inner">
            <Wallet className="h-5 w-5" />
          </div>
          <DrawerTitle className="mt-2">Create New Account</DrawerTitle>
        </DrawerHeader>

        <div className="px-6 pb-6">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Account Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-slate-700">
                Account Name
              </label>
              <Input
                id="name"
                placeholder="e.g., Main checking"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Account Type */}
              <div className="space-y-1.5">
                <label htmlFor="type" className="text-sm font-medium text-slate-700">
                  Account Type
                </label>
                <Select
                  onValueChange={(value) => setValue("type", value)}
                  defaultValue={watch("type")}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CURRENT">Current Account</SelectItem>
                    <SelectItem value="SAVINGS">Savings Account</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>

              {/* Initial Balance */}
              <div className="space-y-1.5">
                <label htmlFor="balance" className="text-sm font-medium text-slate-700">
                  Initial Balance
                </label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("balance")}
                />
                {errors.balance && (
                  <p className="text-sm text-red-500">
                    {errors.balance.message}
                  </p>
                )}
              </div>
            </div>

            {/* Default Account Switch */}
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
              <div className="space-y-0.5">
                <label
                  htmlFor="isDefault"
                  className="text-sm font-medium cursor-pointer text-slate-700"
                >
                  Set As Default
                </label>
                <p className="text-xs text-muted-foreground">
                  This account will be selected by default for transactions.
                </p>
              </div>
              <Switch
                id="isDefault"
                onCheckedChange={(checked) => setValue("isDefault", checked)}
                checked={watch("isDefault")}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>

              <Button
                disabled={createAccountLoading}
                type="submit"
                className="flex-1"
              >
                {createAccountLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default CreateAccountDrawer;
