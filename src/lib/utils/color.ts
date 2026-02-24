export function getColorStatus(status: string) {
  switch (status) {
    case "SUCCESS":
      return {
        text: "text-emerald-500",
        badge: "bg-emerald-50 text-emerald-600",
        dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
      };
    case "PENDING":
      return {
        text: "text-amber-500",
        badge: "bg-amber-50 text-amber-600",
        dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
      };
    case "CANCEL":
      return {
        text: "text-rose-500",
        badge: "bg-rose-50 text-rose-600",
        dot: "bg-rose-500"
      };
    default:
      return {
        text: "text-slate-500",
        badge: "bg-slate-50 text-slate-600",
        dot: "bg-slate-500"
      };
  }
}