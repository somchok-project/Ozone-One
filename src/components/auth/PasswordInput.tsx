"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/input";

interface PasswordInputProps extends Omit<
  InputProps,
  "prefix" | "suffix" | "type"
> {
  /** Override the default Lock icon */
  icon?: React.ReactNode;
}

export function PasswordInput({ icon, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <Input
      type={show ? "text" : "password"}
      prefix={
        icon ?? (
          <Lock className="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-orange-500" />
        )
      }
      suffix={
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="cursor-pointer text-gray-400 transition-colors outline-none hover:text-gray-600"
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      }
      {...props}
    />
  );
}
