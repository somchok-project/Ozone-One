import { type HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const baseStyles = "rounded-xl bg-white";

    const variants = {
      default: "shadow-sm",
      bordered: "border border-gray-200",
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Removed CardHeaderProps as it was an empty interface

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div ref={ref} className={`p-6 ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className = "", as: Component = "h3", children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={`flex items-center gap-2 text-lg font-semibold text-gray-900 ${className}`}
        {...props}
      >
        <span className="h-5 w-1 rounded-full bg-orange-600" />
        {children}
      </Component>
    );
  }
);

CardTitle.displayName = "CardTitle";

// Removed CardContentProps as it was an empty interface

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div ref={ref} className={`px-6 pb-6 ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardContent };
