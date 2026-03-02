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

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum ReviewType {
  BOOTH = "BOOTH",
  MARKET = "MARKET",
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
  type?: BoothType;
  dimension: string;
  latitude?: number | null;
  longitude?: number | null;
  position_x?: number | null;
  position_y?: number | null;
  position_z?: number | null;
  rotation_x?: number | null;
  rotation_y?: number | null;
  rotation_z?: number | null;
  scale?: number | null;
  model_url?: string | null;
  images?: Image[];
  bookings?: Booking[];
  reviews?: Review[];
  zone_id?: string | null;
  zone?: Zone | null;
  user_id?: string | null;
  user?: User | null;
  _count?: {
    bookings: number;
    reviews: number;
  };
  isCurrentlyBooked?: boolean;
}

export interface Image {
  id: string;
  path: string;
  booth_id: string;
  booth?: Booth;
}

export interface Zone {
  id: string;
  name: string;
  description?: string | null;
  color_code?: string | null;
  booths?: Booth[];
}

export interface Booking {
  id: string;
  start_date: Date | string;
  end_date: Date | string;
  total_price: number;
  payment_status: PaymentStatus | string;
  booking_status: BookingStatus | string;
  payment_slip_url: string | null;
  user_id?: string;
  user?: User;
  booth_id?: string;
  booth: {
    id: string;
    name: string;
    price: number;
    images?: { id: string; path: string; booth_id: string }[];
  };
}

export interface Review {
  id: string;
  rating: number; // Decimal in DB
  comment?: string | null;
  created_at: Date;
  user_id: string;
  user?: User;
}
