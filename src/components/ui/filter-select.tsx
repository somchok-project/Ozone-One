"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Filter } from "lucide-react";

export interface FilterSelectOption {
    value: string;
    label: string;
    shortLabel?: string;
    icon?: React.ReactNode;
}

interface FilterSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: FilterSelectOption[];
    placeholder?: string;
    icon?: React.ReactNode;
    dropdownTitle?: string;
}

export function FilterSelect({
    value,
    onChange,
    options,
    placeholder = "ตัวกรอง",
    icon = <Filter className="h-4 w-4" />,
    dropdownTitle
}: FilterSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value);
    const isFiltered = value !== "all" && value !== "";

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`group flex h-[46px] cursor-pointer items-center gap-2.5 rounded-2xl border px-5 transition-all duration-300 ${
                    isFiltered
                        ? "border-orange-500 bg-orange-50 text-orange-700 shadow-[0_0_15px_rgba(249,115,22,0.1)]" 
                        : "border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-600 shadow-sm"
                }`}
            >
                <div className={`transition-colors ${isFiltered ? "text-orange-600" : "text-slate-400 group-hover:text-orange-500"}`}>
                    {icon}
                </div>
                <span className="text-sm font-bold tracking-tight">
                    {!isFiltered ? placeholder : (
                        <span className="flex items-center gap-1.5 flex-nowrap whitespace-nowrap">
                            {selectedOption?.shortLabel || selectedOption?.label} 
                            {selectedOption?.icon && (
                                <span className={isFiltered ? "text-orange-500 flex items-center" : "flex items-center"}>
                                    {selectedOption.icon}
                                </span>
                            )}
                        </span>
                    )}
                </span>
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180 text-orange-500" : "text-slate-300"}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: "circOut" }}
                        className="absolute right-0 top-full z-50 mt-3 min-w-56 overflow-hidden rounded-2xl border border-orange-100 bg-white/95 p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-md md:left-0 md:right-auto"
                    >
                        {dropdownTitle && (
                            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {dropdownTitle}
                            </div>
                        )}
                        <div className="space-y-1">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`group/item flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all ${
                                        value === option.value
                                            ? "bg-orange-500 font-bold text-white shadow-md shadow-orange-200"
                                            : "text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                                    }`}
                                >
                                    <span>{option.label}</span>
                                    {option.icon && (
                                        <div className={`transition-colors shrink-0 flex items-center justify-center ${
                                            value === option.value
                                                ? "text-white fill-white"
                                                : "text-orange-200 fill-orange-100 group-hover/item:text-orange-300 group-hover/item:fill-orange-200"
                                        }`}>
                                            {option.icon}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
