import { type InputHTMLAttributes, forwardRef } from "react";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = "", label, error, id, ...props }, ref) => {
    return (
        <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            {label}
            </label>
        )}
        <div className="relative">
            <div className="absolute left-2.5 bottom-3.5 pointer-events-none">
                <svg className="w-7 h-7 text-gray-900/30" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v3m-3-6V7a3 3 0 1 1 6 0v4m-8 0h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z"/>
                </svg>
            </div>
            <input
            ref={ref}
            id={id}
            className={`w-full pl-10 rounded-2xl border border-gray-300 bg-white px-3 py-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-600 focus:outline-none focus:ring-3 focus:ring-orange-500/10 shadow-md
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""} ${className}`}
            {...props}
            />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;