// components/ui/Input.tsx
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "prefix"
> {
  label?: string;
  error?: string;
  /** ReactNode icon/element rendered on the left side of the input */
  prefix?: React.ReactNode;
  /** ReactNode icon/element rendered on the right side of the input (e.g. eye toggle) */
  suffix?: React.ReactNode;
  /** Optional extra content between label and input (e.g. "forgot password" link) — rendered on the right side of the label row */
  labelRight?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, prefix, suffix, labelRight, id, ...props },
    ref,
  ) => {
    const cls = className ?? "";
    return (
      <div className="w-full space-y-1.5">
        {(label ?? labelRight) && (
          <div className="flex items-center justify-between">
            {label && (
              <label
                htmlFor={id}
                className="block font-sans text-sm font-medium text-gray-700"
              >
                {label}
              </label>
            )}
            {labelRight && labelRight}
          </div>
        )}
        <div className="group relative transition-all duration-200 ease-in-out">
          {prefix && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={`block w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 font-sans text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 ${prefix ? "pl-11" : ""} ${suffix ? "pr-12" : ""} ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : ""} ${cls} `}
            {...props}
          />
          {suffix && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
