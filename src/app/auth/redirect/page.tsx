import { redirectByRole } from "@/app/auth/actions";

export default async function AuthRedirectPage() {
  await redirectByRole();
}
