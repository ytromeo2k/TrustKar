/** TRUSTKAR platform constants */

export const BRAND_NAME = "TrustKar";
export const BRAND_TAGLINE = "Pakistan's Escrow-Protected Marketplace";
export const INSPECTION_PERIOD_HOURS = 48;
export const DISPUTE_RESPONSE_TIMEOUT_HOURS = 48;

export const ESCROW_STATUS = {
  DRAFT: "draft",
  PAYMENT_PENDING: "payment_pending",
  FUNDS_HELD: "funds_held",
  DISPATCHED: "dispatched",
  INSPECTION: "inspection",
  RELEASED: "released",
  DISPUTED: "disputed",
  CANCELLED: "cancelled",
};

export const PAYMENT_METHODS = [
  { id: "easypaisa", name: "EasyPaisa", icon: "wallet" },
  { id: "jazzcash", name: "JazzCash", icon: "wallet" },
  { id: "bank_transfer", name: "Bank Transfer", icon: "building" },
];

/** Firestore collection names */
export const COLLECTIONS = {
  ADS: "ads",
  USERS: "users",
  TRANSACTIONS: "transactions",
  DISPUTES: "disputes",
  NOTIFICATIONS: "notifications",
  ADMIN_LOGS: "admin_logs",
  REVIEWS: "reviews",
  SUPPORT_TICKETS: "support_tickets",
};

/** Subcollections under users/{uid} */
export const USER_SUB = {
  WISHLIST: "wishlist",
  VIEWS: "views",
  PAYMENT_PROOFS: "paymentProofs",
};

export const CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Hyderabad",
  "Sialkot",
  "Gujranwala",
];

export const CONDITIONS = ["Brand New", "Like New", "Good", "Fair", "For Parts"];
