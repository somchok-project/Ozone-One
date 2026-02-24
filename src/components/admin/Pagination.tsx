"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
    totalPages: number;
    currentPage: number;
    pageParamName?: string;
    maxPagesToShow?: number;
}

export function Pagination({
    totalPages,
    currentPage,
    pageParamName = "page",
    maxPagesToShow = 10,
}: PaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    if (totalPages <= 1) return null;

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(pageParamName, pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const handlePageChange = (page: number) => {
        router.push(createPageURL(page), { scroll: false });
    };

    const getPageNumbers = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= 4) {
            return [1, 2, 3, 4, 5, "...", totalPages];
        }

        if (currentPage >= totalPages - 3) {
            return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }

        return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
    };

    return (
        <div className="flex items-center justify-center space-x-2 py-4">
            <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 px-0 border-slate-200 text-slate-500 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 disabled:opacity-50"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous Page</span>
            </Button>
            
            <div className="flex items-center space-x-1">
                {getPageNumbers().map((page, index) => {
                    if (page === "...") {
                        return (
                            <span key={`ellipsis-${index}`} className="px-2 text-slate-400">
                                <MoreHorizontal className="h-4 w-4" />
                            </span>
                        );
                    }

                    const pageNum = page as number;
                    const isActive = currentPage === pageNum;

                    return (
                        <Button
                            key={pageNum}
                            variant={isActive ? "primary" : "outline"}
                            size="sm"
                            className={`h-9 min-w-[36px] px-0 font-semibold transition-all ${
                                isActive 
                                    ? "bg-orange-500 text-white shadow-md shadow-orange-200 border-none" 
                                    : "border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50"
                            }`}
                            onClick={() => handlePageChange(pageNum)}
                        >
                            {pageNum}
                        </Button>
                    );
                })}
            </div>

            <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 px-0 border-slate-200 text-slate-500 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 disabled:opacity-50"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
            >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Page</span>
            </Button>
        </div>
    );
}
