import React from "react";

interface AuthPageWrapperProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthPageWrapper({
  icon,
  title,
  subtitle,
  children,
}: AuthPageWrapperProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-[420px] space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            {icon}
          </div>
          <h2 className="font-sans text-3xl font-bold tracking-tight text-gray-900">
            {title}
          </h2>
          <p className="mt-2 font-sans text-sm text-gray-500">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );
}
