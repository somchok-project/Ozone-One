import Link from "next/link";

interface AuthFooterProps {
  text: string;
  linkText: string;
  href: string;
}

export function AuthFooter({ text, linkText, href }: AuthFooterProps) {
  return (
    <p className="text-center font-sans text-sm text-gray-500">
      {text}{" "}
      <Link
        href={href}
        className="font-semibold text-orange-600 transition-colors hover:text-orange-500 hover:underline"
      >
        {linkText}
      </Link>
    </p>
  );
}
