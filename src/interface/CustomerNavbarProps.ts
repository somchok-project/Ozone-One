import type { User } from "@/types/index";

export interface CustomerNavbarProps {
  user?: User & {
    id?: string;
    role?: string;
  };
}