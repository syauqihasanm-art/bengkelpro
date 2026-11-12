import { UserRole } from "@/types";

export interface DemoSession {
  role: UserRole;
  userId: string;
  userName: string;
  email: string;
  workshopId: string;
  mechanicId?: string;
  customerId?: string;
}

export const DEFAULT_WORKSHOP_ID = "11111111-1111-4111-8111-111111111111";
export const DEFAULT_MECHANIC_ID = "44444444-4444-4444-8444-444444444444";
export const DEFAULT_CUSTOMER_ID = "55555555-5555-4555-8555-555555555555";

export const DEMO_SESSIONS: Record<UserRole, DemoSession> = {
  super_admin: {
    role: "super_admin",
    userId: "00000000-0000-4000-8000-000000000000",
    userName: "Super Admin Platform",
    email: "superadmin@bengkelpro.id",
    workshopId: DEFAULT_WORKSHOP_ID,
  },
  workshop_owner: {
    role: "workshop_owner",
    userId: "22222222-2222-4222-8222-222222222222",
    userName: "Budi Santoso",
    email: "owner@sahabatmotor.id",
    workshopId: DEFAULT_WORKSHOP_ID,
  },
  workshop_admin: {
    role: "workshop_admin",
    userId: "33333333-3333-4333-8333-333333333333",
    userName: "Dewi Lestari",
    email: "admin@sahabatmotor.id",
    workshopId: DEFAULT_WORKSHOP_ID,
  },
  mechanic: {
    role: "mechanic",
    userId: DEFAULT_MECHANIC_ID,
    userName: "Agus Prasetyo",
    email: "mekanik@sahabatmotor.id",
    workshopId: DEFAULT_WORKSHOP_ID,
    mechanicId: DEFAULT_MECHANIC_ID,
  },
  customer: {
    role: "customer",
    userId: "77777777-7777-4777-8777-777777777777",
    userName: "Rudi Hermawan",
    email: "pelanggan@gmail.com",
    workshopId: DEFAULT_WORKSHOP_ID,
    customerId: DEFAULT_CUSTOMER_ID,
  },
};

const STORAGE_KEY = "bengkelpro_active_session";

export function setActiveSession(session: DemoSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage quota errors
  }
}

export function getActiveSession(fallbackRole?: UserRole): DemoSession {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DemoSession;
        if (parsed && parsed.role && (!fallbackRole || parsed.role === fallbackRole)) {
          return parsed;
        }
      }
    } catch {
      // Fallback to default role session
    }
  }
  return DEMO_SESSIONS[fallbackRole || "workshop_owner"];
}

export function clearActiveSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
