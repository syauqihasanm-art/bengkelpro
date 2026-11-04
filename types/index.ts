export type UserRole = "super_admin" | "workshop_owner" | "workshop_admin" | "mechanic" | "customer";

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkshopStatus = "pending" | "approved" | "rejected" | "suspended";
export type SubscriptionTier = "free" | "basic" | "pro" | "business";

export interface Workshop {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  phone: string;
  email: string;
  workshopType: "motor" | "mobil" | "umum";
  address: string;
  city: string;
  province: string;
  description?: string;
  logoUrl?: string;
  status: WorkshopStatus;
  subscriptionTier: SubscriptionTier;
  capacityPerDay: number;
  isPublicListed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkshopMember {
  id: string;
  workshopId: string;
  userId: string;
  role: UserRole;
  status: "active" | "inactive";
  createdAt: string;
  profile?: Profile;
}

export interface Customer {
  id: string;
  workshopId: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  vehiclesCount?: number;
  totalSpent?: number;
}

export interface Vehicle {
  id: string;
  workshopId: string;
  customerId: string;
  vehicleType: "motor" | "mobil" | "truk" | "lainnya";
  brand: string;
  model: string;
  productionYear?: number;
  licensePlate: string;
  chassisNumber?: string;
  engineNumber?: string;
  currentOdometer: number;
  notes?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
}

export interface WorkshopService {
  id: string;
  workshopId: string;
  code: string;
  name: string;
  category: string;
  standardDurationMinutes: number;
  basePrice: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "in_service"
  | "completed"
  | "cancelled"
  | "rejected";

export interface Booking {
  id: string;
  workshopId: string;
  customerId: string;
  vehicleId: string;
  bookingCode: string;
  serviceDate: string;
  timeSlot: string;
  customerComplaint: string;
  status: BookingStatus;
  estimatedCost?: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  vehicle?: Vehicle;
}

export type WorkOrderStatus =
  | "waiting"
  | "inspection"
  | "waiting_approval"
  | "in_progress"
  | "waiting_parts"
  | "completed"
  | "delivered"
  | "cancelled";

export interface WorkOrderItem {
  id: string;
  workOrderId: string;
  itemType: "service" | "part";
  referenceId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isApproved: boolean;
  isPartsDeducted: boolean;
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  workshopId: string;
  workOrderNumber: string;
  bookingId?: string;
  customerId: string;
  vehicleId: string;
  odometerIn: number;
  customerComplaint: string;
  inspectionFindings?: string;
  status: WorkOrderStatus;
  totalLabor: number;
  totalParts: number;
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  customerApprovalStatus: "pending" | "approved" | "rejected";
  approvedAt?: string;
  finalNotes?: string;
  items?: WorkOrderItem[];
  customer?: Customer;
  vehicle?: Vehicle;
  assignedMechanics?: Mechanic[];
  createdAt: string;
  updatedAt: string;
}

export interface Mechanic {
  id: string;
  workshopId: string;
  userId?: string;
  name: string;
  phone: string;
  specialization: string;
  status: "active" | "inactive" | "on_leave";
  rating?: number;
  activeJobsCount?: number;
  completedJobsCount?: number;
  createdAt: string;
}

export interface Product {
  id: string;
  workshopId: string;
  categoryId?: string;
  sku: string;
  name: string;
  brand: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStock: number;
  unit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  workshopId: string;
  productId: string;
  productName?: string;
  referenceType: "purchase" | "work_order" | "adjustment" | "invoice";
  referenceId?: string;
  movementType: "in" | "out" | "adjustment";
  quantity: number;
  previousStock: number;
  currentStock: number;
  unitCost: number;
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  workshopId: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  isReceived: boolean;
}

export interface Purchase {
  id: string;
  workshopId: string;
  supplierId: string;
  supplierName?: string;
  purchaseNumber: string;
  purchaseDate: string;
  totalAmount: number;
  status: "draft" | "ordered" | "received" | "cancelled";
  notes?: string;
  items?: PurchaseItem[];
  createdAt: string;
}

export type InvoiceStatus = "draft" | "unpaid" | "partially_paid" | "paid" | "cancelled" | "refunded";

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  itemType: "service" | "part";
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt?: string;
}

export interface Invoice {
  id: string;
  workshopId: string;
  invoiceNumber: string;
  workOrderId?: string;
  customerId: string;
  customerName?: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  notes?: string;
  items?: InvoiceItem[];
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  workshopId: string;
  invoiceId: string;
  paymentNumber: string;
  amount: number;
  paymentMethod: "cash" | "bank_transfer" | "qris" | "other";
  paymentDate: string;
  externalReference?: string;
  status: "pending" | "success" | "failed" | "refunded";
  verifiedBy?: string;
  notes?: string;
  idempotencyKey?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  workshopId: string;
  category: "operasional" | "gaji" | "listrik_air" | "sewa" | "peralatan" | "lainnya";
  title: string;
  amount: number;
  expenseDate: string;
  paymentMethod: string;
  receiptUrl?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

export interface ServiceHistory {
  id: string;
  workshopId: string;
  vehicleId: string;
  customerId: string;
  workOrderId: string;
  invoiceId?: string;
  serviceDate: string;
  odometer: number;
  complaint: string;
  findings: string;
  workCompleted: string;
  partsReplaced: string;
  totalCost: number;
  nextMaintenanceOdometer?: number;
  nextMaintenanceDate?: string;
  reminderStatus: "pending" | "sent" | "dismissed";
  createdAt: string;
}

export interface Subscription {
  id: string;
  workshopId: string;
  planCode: SubscriptionTier;
  status: "active" | "past_due" | "cancelled" | "expired";
  startDate: string;
  endDate: string;
  priceMonthly: number;
  maxStaff: number;
  maxWorkOrdersPerMonth: number;
  hasAi: boolean;
  hasMultiBranch: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  workshopId?: string;
  userId?: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  createdAt: string;
}
