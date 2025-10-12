"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { categoryColors } from "@/data/categories";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Lock,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import useFetch from "@/hooks/use-fetch";
import { bulkDeleteTransactions } from "@/action/account";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";

const ITEMS_PER_PAGE = 10;

const TransactionTable = ({ transactions }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");

  // Apply SearchFilter Here
  const filteredAndSortedTransaction = useMemo(() => {
    let result = [...transactions];
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((transaction) =>
        transaction.description?.toLowerCase().includes(searchLower)
      );
    }
    // Apply ReccurringFilter Here
    if (recurringFilter) {
      result = result.filter((transaction) => {
        if (recurringFilter === "recurring") {
          return transaction.isRecurring;
        }
        return !transaction.isRecurring;
      });
    }
    // Apply TypeFilter Here
    if (filterType) {
      result = result.filter((transaction) => transaction.type === filterType);
    }
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;

        case "category":
          comparison = a.category.localeCompare(b.category);
          break;

        default:
          comparison = 0;
          break;
      }
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchTerm, filterType, sortConfig, recurringFilter]);
  const RECURRING_INTERVALS = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly",
  };

  //   console.log(selectedIds);

  // Pagination calculations
  const totalPages = Math.ceil(
    filteredAndSortedTransaction.length / ITEMS_PER_PAGE
  );
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTransaction.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredAndSortedTransaction, currentPage]);

  const router = useRouter();
  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };
  const handleSelectAll = (id) => {
    setSelectedIds((current) =>
      current.length === paginatedTransactions.length
        ? []
        : paginatedTransactions.map((t) => t.id)
    );
  };
  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
  } = useFetch(bulkDeleteTransactions);
  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} transactions`
      )
    ) {
      return;
    }
    deleteFn(selectedIds);
  };

  useEffect(() => {
    if (deleted && !deleteLoading) {
      toast.error("Transaction deleted successfully");
    }
  }, [deleteLoading, deleted]);

  const handleClearFilter = () => {
    setSearchTerm("");
    setFilterType("");
    setRecurringFilter("");
    setCurrentPage(1);
  };
  // Apply Pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSelectedIds([]); // Clear selections on page change
  };
  return (
    <div className="space-y-4">
      {deleteLoading && (
        <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
      )}
      <div className="flex flex-col md:flex-row gap-4 w-full">
        {/* Search Input - takes 6/12 on md and above */}
        <div className="relative w-full md:w-6/12">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8 w-full"
            placeholder="Search Transaction...."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Filters & Buttons - each filter 3/12 on md and above */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-6/12">
          {/* All Type */}
          <Select
            value={filterType}
            onValueChange={(value) => {
              setFilterType(value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-1/2 md:w-6/12"
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>
          {/* Recurring Filter */}
          <Select
            value={recurringFilter}
            onValueChange={(value) => {
              setRecurringFilter(value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-1/2 md:w-6/12"
          >
            <SelectTrigger>
              <SelectValue placeholder="All Transaction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">Recurring Only</SelectItem>
              <SelectItem value="non-recurring">Non-Recurring Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Bulk Delete Button */}
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="mt-2 sm:mt-0"
            >
              <Trash className="h-4 w-4 mr-2" /> Delete Selected (
              {selectedIds.length})
            </Button>
          )}

          {/* Clear Filters Button */}
          {(searchTerm || filterType || recurringFilter) && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearFilter}
              className="mt-2 sm:mt-0"
            >
              <X className="h-4 w-5" />
            </Button>
          )}
        </div>
      </div>

     <div className="w-full overflow-x-auto rounded-md border">
      <div className="min-w-[900px]"> {/* force horizontal scroll on small devices */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={
                    selectedIds.length === paginatedTransactions.length &&
                    paginatedTransactions.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>

              {/* Date */}
              <TableHead
                className="cursor-pointer whitespace-nowrap"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  Date
                  {sortConfig.field === "date" &&
                  sortConfig.direction === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>

              {/* Description */}
              <TableHead>Description</TableHead>

              {/* Category */}
              <TableHead
                className="cursor-pointer whitespace-nowrap"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  Category
                  {sortConfig.field === "category" &&
                  sortConfig.direction === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>

              {/* Amount */}
              <TableHead
                className="cursor-pointer text-right whitespace-nowrap"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end">
                  Amount
                  {sortConfig.field === "amount" &&
                  sortConfig.direction === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>

              {/* Recurring */}
              <TableHead className="whitespace-nowrap">Recurring</TableHead>

              {/* Actions */}
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-6"
                >
                  No Transaction Found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  {/* Select */}
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(transaction.id)}
                      onCheckedChange={() => handleSelect(transaction.id)}
                    />
                  </TableCell>

                  {/* Date */}
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(transaction.date), "PP")}
                  </TableCell>

                  {/* Description */}
                  <TableCell>{transaction.description}</TableCell>

                  {/* Category */}
                  <TableCell className="capitalize">
                    <span
                      style={{
                        background: categoryColors[transaction.category],
                      }}
                      className="px-2 py-1 rounded text-white text-xs sm:text-sm whitespace-nowrap"
                    >
                      {transaction.category}
                    </span>
                  </TableCell>

                  {/* Amount */}
                  <TableCell
                    style={{
                      color: transaction.type === "EXPENSE" ? "red" : "green",
                    }}
                    className="text-right font-medium whitespace-nowrap"
                  >
                    {transaction.type === "EXPENSE" ? "-" : "+"}
                    {transaction.amount.toFixed(2)}
                  </TableCell>

                  {/* Recurring */}
                  <TableCell>
                    {transaction.isRecurring ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant="outline"
                              className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200 whitespace-nowrap"
                            >
                              <RefreshCw className="h-3 w-3" />
                              {
                                RECURRING_INTERVALS[
                                  transaction.recurringInterval
                                ]
                              }
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <div className="font-medium">Next Date:</div>
                              <div>
                                {format(
                                  new Date(transaction.nextRecurringDate),
                                  "PP"
                                )}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Badge variant="outline" className="gap-1 whitespace-nowrap">
                        <Clock className="h-3 w-3" /> One-Time
                      </Badge>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="h-8 w-8 p-0" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel
                          onClick={() =>
                            router.push(
                              `/transaction/create?edit=${transaction.id}`
                            )
                          }
                          className="cursor-pointer"
                        >
                          Edit
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive cursor-pointer"
                          onClick={() => deleteFn([transaction.id])}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2  h-12">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
