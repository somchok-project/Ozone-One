interface DividerProps {
  text?: string;
}

export function Divider({ text = "หรือ" }: DividerProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-100" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-white px-4 font-sans text-xs text-gray-400">
          {text}
        </span>
      </div>
    </div>
  );
}
