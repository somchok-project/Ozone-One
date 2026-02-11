export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum BoothType {
  FREE = "FREE",
  BOOKING = "BOOKING",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  CANCEL = "CANCEL",
}

export interface User {
  id: string;
  name?: string | null;
  phone_number?: string | null;
  password?: string | null;
  email: string;
  emailVerified?: Date | null;
  image?: string;
  role: Role | string;
  accounts?: Account[];
  sessions?: Session[];
  bookings?: Booking[];
  booths?: Booth[];
  reviews?: Review[];
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
  user?: User;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  user?: User;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

export interface Booth {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
  type: BoothType;
  latitude: number; // Decimal in DB, number in JS/TS usually fine for frontend
  longitude: number;
  images?: Image[];
  bookings?: Booking[];
  user_id: string;
  user?: User;
}

export interface Image {
  id: string;
  path: string;
  booth_id: string;
  booth?: Booth;
}

export interface Booking {
  id: string;
  start_date: Date;
  end_date: Date;
  total_price: number;
  payment_status: PaymentStatus;
  payment_slip_url: string;
  user_id: string;
  user?: User;
  booth_id: string;
  booth?: Booth;
}

export interface Review {
  id: string;
  rating: number; // Decimal in DB
  comment?: string | null;
  created_at: Date;
  user_id: string;
  user?: User;
}
