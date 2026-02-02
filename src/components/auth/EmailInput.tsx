import { type InputHTMLAttributes, forwardRef } from "react";

interface EmailInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
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
            <div className="absolute left-2 bottom-3 pointer-events-none">
                <svg className="w-7 h-7 text-gray-900/30" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m3.5 5.5 7.893 6.036a1 1 0 0 0 1.214 0L20.5 5.5M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"/>
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

EmailInput.displayName = "EmailInput";

export default EmailInput;