import { ArrowRight } from "lucide-react";

interface SubmitButtonProps {
  children: React.ReactNode;
}

export function SubmitButton({ children }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-4 font-sans text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:shadow-orange-500/20 active:scale-[0.99]"
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </button>
  );
}
