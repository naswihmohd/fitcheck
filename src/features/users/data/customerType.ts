import { Timestamp } from "firebase/firestore";
import type { ShippingAddress } from "../../orders/data/orderTypes";

export interface CustomerProps {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  whatsappNumber?: string | null;
  profileImage: string;
  role: "admin" | "manager" | "user";
  isActive: boolean;

  createdAt: Timestamp;

  shippingAddress: ShippingAddress[];
}