import { z } from "zod";

// Workshop Registration Schema
export const registerWorkshopSchema = z.object({
  name: z.string().min(3, "Nama bengkel minimal 3 karakter"),
  ownerName: z.string().min(3, "Nama pemilik minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  workshopType: z.enum(["motor", "mobil", "umum"], {
    errorMap: () => ({ message: "Pilih tipe bengkel yang valid" }),
  }),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  city: z.string().min(2, "Kota wajib diisi"),
  province: z.string().min(2, "Provinsi wajib diisi"),
  description: z.string().optional(),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
});

export type RegisterWorkshopInput = z.infer<typeof registerWorkshopSchema>;

// Login Schema
export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Customer Schema
export const customerSchema = z.object({
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  phone: z.string().min(8, "Nomor telepon minimal 8 digit"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;

// Vehicle Schema
export const vehicleSchema = z.object({
  customerId: z.string().uuid("Customer ID tidak valid"),
  vehicleType: z.enum(["motor", "mobil", "truk", "lainnya"]),
  brand: z.string().min(2, "Merk kendaraan wajib diisi"),
  model: z.string().min(1, "Model kendaraan wajib diisi"),
  productionYear: z.coerce.number().min(1980).max(2030).optional(),
  licensePlate: z.string().min(3, "Nomor polisi wajib diisi"),
  chassisNumber: z.string().optional(),
  engineNumber: z.string().optional(),
  currentOdometer: z.coerce.number().min(0, "Odometer tidak boleh negatif"),
  notes: z.string().optional(),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;

// Booking Schema
export const bookingSchema = z.object({
  workshopId: z.string().uuid("Workshop ID tidak valid"),
  customerId: z.string().uuid("Customer ID wajib diisi"),
  vehicleId: z.string().uuid("Kendaraan wajib dipilih"),
  serviceDate: z.string().min(10, "Tanggal booking wajib diisi"),
  timeSlot: z.string().min(3, "Jam servis wajib dipilih"),
  customerComplaint: z.string().min(5, "Keluhan minimal 5 karakter"),
});

export type BookingInput = z.infer<typeof bookingSchema>;

// Work Order Item Schema
export const workOrderItemSchema = z.object({
  itemType: z.enum(["service", "part"]),
  referenceId: z.string().optional(),
  name: z.string().min(2, "Nama item wajib diisi"),
  quantity: z.coerce.number().min(1, "Jumlah minimal 1"),
  unitPrice: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  isApproved: z.boolean().default(true),
});

// Work Order Creation / Update Schema
export const workOrderSchema = z.object({
  bookingId: z.string().uuid().optional().nullable(),
  customerId: z.string().uuid("Customer wajib dipilih"),
  vehicleId: z.string().uuid("Kendaraan wajib dipilih"),
  odometerIn: z.coerce.number().min(0, "Odometer tidak boleh negatif"),
  customerComplaint: z.string().min(3, "Keluhan wajib diisi"),
  inspectionFindings: z.string().optional(),
  status: z
    .enum([
      "waiting",
      "inspection",
      "waiting_approval",
      "in_progress",
      "waiting_parts",
      "work_done",
      "awaiting_payment",
      "completed",
      "delivered",
      "cancelled",
    ])
    .default("waiting"),
  items: z.array(workOrderItemSchema).default([]),
  discount: z.coerce.number().min(0).default(0),
  tax: z.coerce.number().min(0).default(0),
  finalNotes: z.string().optional(),
  assignedMechanicIds: z.array(z.string().min(1)).optional(),
});

export type WorkOrderInput = z.infer<typeof workOrderSchema>;

// Product / Inventory Schema
export const productSchema = z.object({
  sku: z.string().min(2, "SKU minimal 2 karakter"),
  name: z.string().min(2, "Nama produk minimal 2 karakter"),
  brand: z.string().min(1, "Merk produk wajib diisi"),
  categoryId: z.string().uuid().optional().nullable(),
  purchasePrice: z.coerce.number().min(0, "Harga beli tidak boleh negatif"),
  sellingPrice: z.coerce.number().min(0, "Harga jual tidak boleh negatif"),
  stockQuantity: z.coerce.number().int().min(0, "Stok awal minimal 0"),
  minStock: z.coerce.number().int().min(0, "Stok minimum minimal 0"),
  unit: z.string().min(1, "Satuan wajib diisi").default("pcs"),
});

export type ProductInput = z.infer<typeof productSchema>;

// Stock Adjustment Schema
export const stockAdjustmentSchema = z.object({
  productId: z.string().uuid("Produk wajib dipilih"),
  movementType: z.enum(["in", "out", "adjustment"]),
  quantity: z.coerce.number().int().min(1, "Jumlah minimal 1"),
  notes: z.string().min(3, "Alasan penyesuaian wajib diisi"),
});

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;

// Supplier Schema
export const supplierSchema = z.object({
  name: z.string().min(2, "Nama supplier minimal 2 karakter"),
  contactPerson: z.string().min(2, "Nama kontak minimal 2 karakter"),
  phone: z.string().min(8, "Nomor telepon minimal 8 digit"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  address: z.string().optional(),
});

export type SupplierInput = z.infer<typeof supplierSchema>;

// Purchase Order Schema
export const purchaseOrderSchema = z.object({
  supplierId: z.string().uuid("Supplier wajib dipilih"),
  purchaseDate: z.string().min(10, "Tanggal wajib diisi"),
  items: z.array(
    z.object({
      productId: z.string().uuid("Produk wajib dipilih"),
      quantity: z.coerce.number().int().min(1, "Jumlah minimal 1"),
      unitCost: z.coerce.number().min(0, "Biaya per unit tidak boleh negatif"),
    })
  ).min(1, "Minimal pilih 1 produk"),
  notes: z.string().optional(),
});

export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>;

// Payment Recording Schema
export const paymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice wajib dipilih"),
  amount: z.coerce.number().min(1, "Jumlah pembayaran harus lebih dari 0"),
  paymentMethod: z.enum(["cash", "bank_transfer", "qris", "other"]),
  notes: z.string().optional(),
  externalReference: z.string().optional(),
  qrisConfirmed: z.boolean().optional(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;

// Operating Expense Schema
export const expenseSchema = z.object({
  category: z.enum(["operasional", "gaji", "listrik_air", "sewa", "peralatan", "lainnya"]),
  title: z.string().min(3, "Judul pengeluaran minimal 3 karakter"),
  amount: z.coerce.number().min(1, "Nominal pengeluaran harus lebih dari 0"),
  expenseDate: z.string().min(10, "Tanggal pengeluaran wajib diisi"),
  paymentMethod: z.string().default("cash"),
  notes: z.string().optional(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

// Mechanic Schema
export const mechanicSchema = z.object({
  name: z.string().min(2, "Nama mekanik minimal 2 karakter"),
  phone: z.string().min(8, "Nomor telepon minimal 8 digit"),
  specialization: z.string().min(2, "Spesialisasi wajib diisi"),
  status: z.enum(["active", "inactive", "on_leave"]).default("active"),
});

export type MechanicInput = z.infer<typeof mechanicSchema>;
