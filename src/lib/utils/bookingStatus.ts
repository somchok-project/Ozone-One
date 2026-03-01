export function getBookingStatusColor(status: string): string {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-50 text-green-700";
    case "PENDING":
      return "bg-amber-50 text-amber-700";
    case "COMPLETED":
      return "bg-blue-50 text-blue-700";
    case "CANCELLED":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-50 text-slate-600";
  }
}

export function getBookingStatusLabel(status: string): string {
  switch (status) {
    case "CONFIRMED":
      return "ยืนยันแล้ว";
    case "PENDING":
      return "รอดำเนินการ";
    case "COMPLETED":
      return "เสร็จสิ้น";
    case "CANCELLED":
      return "ยกเลิก";
    default:
      return status;
  }
}
