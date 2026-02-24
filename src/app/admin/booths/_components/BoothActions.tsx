"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { MoreHorizontal, Edit, Trash, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui";
import { deleteBoothAction } from "../actions";
import { toast } from "sonner";

export function BoothActions({ boothId }: { boothId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = () => {
        startTransition(async () => {
            const toastId = toast.loading("กำลังลบข้อมูล...");
            const res = await deleteBoothAction(boothId);
            if (!res?.success) {
                toast.error("เกิดข้อผิดพลาดในการลบบูธ", { id: toastId });
            } else {
                toast.success("ลบข้อมูลบูธเรียบร้อยแล้ว", { id: toastId });
                setIsOpen(false);
                setShowDeleteModal(false);
            }
        });
    };

    return (
        <div className="relative flex justify-end" ref={dropdownRef}>
            <Button 
                variant="ghost" 
                size="sm" 
                className="h-10 w-10 p-0 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                onClick={() => setIsOpen(!isOpen)}
            >
                <MoreHorizontal className="h-6 w-6" />
            </Button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50">
                    <Link href={`/admin/booths/${boothId}/edit`} onClick={() => setIsOpen(false)}>
                        <button className="w-full flex items-center px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-orange-500 transition-colors">
                            <Edit className="h-4 w-4 mr-2.5" />
                            แก้ไขข้อมูล
                        </button>
                    </Link>
                    <button 
                        onClick={() => {
                            setIsOpen(false);
                            setShowDeleteModal(true);
                        }}
                        className="w-full flex items-center px-4 py-2.5 text-[13px] font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <Trash className="h-4 w-4 mr-2.5" />
                        ลบข้อมูล
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-sm rounded-[32px] bg-white p-8 shadow-2xl relative">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 mx-auto">
                            <AlertTriangle className="h-8 w-8" />
                        </div>
                        <h3 className="text-center text-xl font-black text-slate-900 mb-2">ยืนยันการลบข้อมูล</h3>
                        <p className="text-center text-sm text-slate-500 mb-8 mx-auto max-w-[260px]">
                            คุณแน่ใจหรือไม่ว่าต้องการลบบูธนี้? <br/><span className="text-red-500 font-medium">ข้อมูลทั้งหมดที่เกี่ยวข้องจะถูกลบและไม่สามารถกู้คืนได้</span>
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button 
                                onClick={handleDelete}
                                disabled={isPending}
                                className={`h-14 w-full rounded-2xl bg-red-500 text-base font-bold text-white shadow-lg shadow-red-200 hover:bg-red-600 transition-all active:scale-[0.98] ${isPending ? 'opacity-50' : ''}`}
                            >
                                {isPending ? "กำลังลบ..." : "ใช่, ลบข้อมูลเลย"}
                            </Button>
                            <Button 
                                variant="ghost"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isPending}
                                className="h-14 w-full rounded-2xl text-base font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-[0.98]"
                            >
                                ยกเลิก
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
