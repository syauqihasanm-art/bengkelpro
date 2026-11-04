import { initialStore, BengkelStore } from "./store";
import {
  Customer,
  Vehicle,
  Booking,
  WorkOrder,
  WorkOrderItem,
  Product,
  StockMovement,
  Supplier,
  Purchase,
  Invoice,
  Payment,
  Expense,
  ServiceHistory,
  Mechanic,
  Workshop,
  Profile,
  Subscription,
  AuditLog,
} from "@/types";
import { calculateTotals } from "./utils";

// In-memory persistent database singleton for the Next.js runtime
declare global {
  // eslint-disable-next-line no-var
  var __bengkelStore: BengkelStore | undefined;
}

if (!globalThis.__bengkelStore) {
  globalThis.__bengkelStore = JSON.parse(JSON.stringify(initialStore));
}

function getStore(): BengkelStore {
  if (!globalThis.__bengkelStore) {
    globalThis.__bengkelStore = JSON.parse(JSON.stringify(initialStore));
  }
  return globalThis.__bengkelStore as BengkelStore;
}

export const db = {
  // ==========================================
  // WORKSHOPS & MULTI-TENANCY
  // ==========================================
  getWorkshops(): Workshop[] {
    return getStore().workshops;
  },

  getWorkshopById(id: string): Workshop | undefined {
    return getStore().workshops.find((w) => w.id === id);
  },

  getWorkshopBySlug(slug: string): Workshop | undefined {
    return getStore().workshops.find((w) => w.slug === slug);
  },

  createWorkshop(data: Omit<Workshop, "id" | "createdAt" | "updatedAt">): Workshop {
    const store = getStore();
    const newWorkshop: Workshop = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.workshops.push(newWorkshop);

    // Create free subscription automatically
    const newSub: Subscription = {
      id: crypto.randomUUID(),
      workshopId: newWorkshop.id,
      planCode: "free",
      status: "active",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      priceMonthly: 0,
      maxStaff: 2,
      maxWorkOrdersPerMonth: 30,
      hasAi: false,
      hasMultiBranch: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.subscriptions.push(newSub);

    return newWorkshop;
  },

  updateWorkshopStatus(id: string, status: Workshop["status"]): Workshop {
    const workshop = this.getWorkshopById(id);
    if (!workshop) throw new Error("Workshop not found");
    workshop.status = status;
    workshop.updatedAt = new Date().toISOString();
    return workshop;
  },

  // ==========================================
  // CUSTOMERS
  // ==========================================
  getCustomers(workshopId: string, search = ""): Customer[] {
    const query = search.toLowerCase().trim();
    return getStore()
      .customers.filter((c) => c.workshopId === workshopId && !c.isArchived)
      .filter((c) => !query || c.fullName.toLowerCase().includes(query) || c.phone.includes(query))
      .map((c) => {
        const vehiclesCount = getStore().vehicles.filter((v) => v.customerId === c.id && !v.isArchived).length;
        const totalSpent = getStore()
          .invoices.filter((inv) => inv.customerId === c.id && inv.status === "paid")
          .reduce((sum, inv) => sum + inv.totalAmount, 0);
        return { ...c, vehiclesCount, totalSpent };
      });
  },

  getCustomerById(workshopId: string, id: string): Customer | undefined {
    const customer = getStore().customers.find((c) => c.id === id && c.workshopId === workshopId);
    if (!customer) return undefined;
    const vehiclesCount = getStore().vehicles.filter((v) => v.customerId === customer.id && !v.isArchived).length;
    return { ...customer, vehiclesCount };
  },

  createCustomer(workshopId: string, data: Omit<Customer, "id" | "workshopId" | "createdAt" | "updatedAt" | "isArchived">): Customer {
    const store = getStore();
    // Prevent duplicate phone in same workshop
    const existing = store.customers.find((c) => c.workshopId === workshopId && c.phone === data.phone && !c.isArchived);
    if (existing) {
      throw new Error(`Pelanggan dengan nomor telepon ${data.phone} sudah terdaftar.`);
    }

    const newCustomer: Customer = {
      ...data,
      id: crypto.randomUUID(),
      workshopId,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.customers.push(newCustomer);
    return newCustomer;
  },

  updateCustomer(workshopId: string, id: string, data: Partial<Customer>): Customer {
    const customer = getStore().customers.find((c) => c.id === id && c.workshopId === workshopId);
    if (!customer) throw new Error("Pelanggan tidak ditemukan");
    Object.assign(customer, data, { updatedAt: new Date().toISOString() });
    return customer;
  },

  archiveCustomer(workshopId: string, id: string): boolean {
    const customer = getStore().customers.find((c) => c.id === id && c.workshopId === workshopId);
    if (!customer) return false;
    customer.isArchived = true;
    customer.updatedAt = new Date().toISOString();
    return true;
  },

  // ==========================================
  // VEHICLES
  // ==========================================
  getVehicles(workshopId: string, customerId?: string, search = ""): Vehicle[] {
    const query = search.toLowerCase().trim();
    return getStore()
      .vehicles.filter((v) => v.workshopId === workshopId && !v.isArchived)
      .filter((v) => (!customerId || v.customerId === customerId))
      .filter((v) => !query || v.licensePlate.toLowerCase().includes(query) || v.brand.toLowerCase().includes(query) || v.model.toLowerCase().includes(query))
      .map((v) => ({
        ...v,
        customer: getStore().customers.find((c) => c.id === v.customerId),
      }));
  },

  getVehicleById(workshopId: string, id: string): Vehicle | undefined {
    const vehicle = getStore().vehicles.find((v) => v.id === id && v.workshopId === workshopId);
    if (!vehicle) return undefined;
    return {
      ...vehicle,
      customer: getStore().customers.find((c) => c.id === vehicle.customerId),
    };
  },

  createVehicle(workshopId: string, data: Omit<Vehicle, "id" | "workshopId" | "createdAt" | "updatedAt" | "isArchived">): Vehicle {
    const store = getStore();
    // Validate customer exists in this workshop
    const customer = store.customers.find((c) => c.id === data.customerId && c.workshopId === workshopId);
    if (!customer) throw new Error("Customer tidak valid untuk bengkel ini.");

    const newVehicle: Vehicle = {
      ...data,
      licensePlate: data.licensePlate.toUpperCase().trim(),
      id: crypto.randomUUID(),
      workshopId,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.vehicles.push(newVehicle);
    return newVehicle;
  },

  updateVehicle(workshopId: string, id: string, data: Partial<Vehicle>): Vehicle {
    const vehicle = getStore().vehicles.find((v) => v.id === id && v.workshopId === workshopId);
    if (!vehicle) throw new Error("Kendaraan tidak ditemukan.");

    // Validate odometer monotonically increases unless authorized
    if (data.currentOdometer !== undefined && data.currentOdometer < vehicle.currentOdometer) {
      throw new Error(`Odometer baru (${data.currentOdometer}) tidak boleh lebih rendah dari odometer sebelumnya (${vehicle.currentOdometer}).`);
    }

    Object.assign(vehicle, data, { updatedAt: new Date().toISOString() });
    return vehicle;
  },

  // ==========================================
  // BOOKINGS & QUEUE
  // ==========================================
  getBookings(workshopId: string, date?: string): Booking[] {
    return getStore()
      .bookings.filter((b) => b.workshopId === workshopId)
      .filter((b) => !date || b.serviceDate === date)
      .sort((a, b) => new Date(b.serviceDate + "T" + b.timeSlot.slice(0, 5)).getTime() - new Date(a.serviceDate + "T" + a.timeSlot.slice(0, 5)).getTime())
      .map((b) => ({
        ...b,
        customer: getStore().customers.find((c) => c.id === b.customerId),
        vehicle: getStore().vehicles.find((v) => v.id === b.vehicleId),
      }));
  },

  getBookingById(workshopId: string, id: string): Booking | undefined {
    const booking = getStore().bookings.find((b) => b.id === id && b.workshopId === workshopId);
    if (!booking) return undefined;
    return {
      ...booking,
      customer: getStore().customers.find((c) => c.id === booking.customerId),
      vehicle: getStore().vehicles.find((v) => v.id === booking.vehicleId),
    };
  },

  createBooking(workshopId: string, data: Omit<Booking, "id" | "workshopId" | "bookingCode" | "status" | "createdAt" | "updatedAt">): Booking {
    const store = getStore();
    const workshop = store.workshops.find((w) => w.id === workshopId);
    if (!workshop) throw new Error("Bengkel tidak ditemukan.");

    // Check workshop capacity for the selected date
    const sameDateBookings = store.bookings.filter(
      (b) => b.workshopId === workshopId && b.serviceDate === data.serviceDate && b.status !== "cancelled" && b.status !== "rejected"
    );

    if (sameDateBookings.length >= workshop.capacityPerDay) {
      throw new Error(`Kapasitas servis bengkel pada tanggal ${data.serviceDate} sudah penuh (${workshop.capacityPerDay} slot).`);
    }

    // Check double booking for the exact vehicle on the same date
    const vehicleAlreadyBooked = sameDateBookings.some((b) => b.vehicleId === data.vehicleId);
    if (vehicleAlreadyBooked) {
      throw new Error("Kendaraan ini sudah memiliki jadwal booking pada tanggal yang sama.");
    }

    const code = `BKG-${new Date().toISOString().slice(2, 4)}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(store.bookings.length + 1).padStart(4, "0")}`;

    const newBooking: Booking = {
      ...data,
      id: crypto.randomUUID(),
      workshopId,
      bookingCode: code,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.bookings.push(newBooking);
    return newBooking;
  },

  updateBookingStatus(workshopId: string, id: string, status: Booking["status"], notes?: string): Booking {
    const booking = getStore().bookings.find((b) => b.id === id && b.workshopId === workshopId);
    if (!booking) throw new Error("Booking tidak ditemukan.");
    booking.status = status;
    if (notes) booking.adminNotes = notes;
    booking.updatedAt = new Date().toISOString();
    return booking;
  },

  // ==========================================
  // WORK ORDERS & REPAIR WORKFLOW
  // ==========================================
  getWorkOrders(workshopId: string, status?: WorkOrder["status"]): WorkOrder[] {
    return getStore()
      .workOrders.filter((wo) => wo.workshopId === workshopId)
      .filter((wo) => !status || wo.status === status)
      .map((wo) => ({
        ...wo,
        customer: getStore().customers.find((c) => c.id === wo.customerId),
        vehicle: getStore().vehicles.find((v) => v.id === wo.vehicleId),
      }));
  },

  getWorkOrderById(workshopId: string, id: string): WorkOrder | undefined {
    const wo = getStore().workOrders.find((w) => w.id === id && w.workshopId === workshopId);
    if (!wo) return undefined;
    return {
      ...wo,
      customer: getStore().customers.find((c) => c.id === wo.customerId),
      vehicle: getStore().vehicles.find((v) => v.id === wo.vehicleId),
    };
  },

  createWorkOrder(workshopId: string, data: {
    bookingId?: string;
    customerId: string;
    vehicleId: string;
    odometerIn: number;
    customerComplaint: string;
    inspectionFindings?: string;
    items?: Omit<WorkOrderItem, "id" | "workOrderId" | "totalPrice" | "isPartsDeducted" | "createdAt">[];
    discount?: number;
    tax?: number;
    assignedMechanicIds?: string[];
  }): WorkOrder {
    const store = getStore();

    // Enforce subscription work order limits
    const sub = store.subscriptions.find((s) => s.workshopId === workshopId && s.status === "active");
    if (sub && sub.maxWorkOrdersPerMonth < 9999) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyCount = store.workOrders.filter(
        (w) => w.workshopId === workshopId && w.createdAt.startsWith(currentMonth)
      ).length;
      if (monthlyCount >= sub.maxWorkOrdersPerMonth) {
        throw new Error(`Batas kuota SPK bulanan paket ${sub.planCode.toUpperCase()} (${sub.maxWorkOrdersPerMonth} SPK) telah tercapai. Harap upgrade langganan Anda.`);
      }
    }

    const number = `WO-${new Date().toISOString().slice(2, 4)}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(store.workOrders.length + 1).padStart(4, "0")}`;

    const workOrderId = crypto.randomUUID();
    const items: WorkOrderItem[] = (data.items || []).map((it) => ({
      ...it,
      id: crypto.randomUUID(),
      workOrderId,
      totalPrice: it.quantity * it.unitPrice,
      isApproved: it.isApproved ?? true,
      isPartsDeducted: false,
      createdAt: new Date().toISOString(),
    }));

    const totalLabor = items
      .filter((it) => it.itemType === "service" && it.isApproved)
      .reduce((sum, it) => sum + it.totalPrice, 0);
    const totalParts = items
      .filter((it) => it.itemType === "part" && it.isApproved)
      .reduce((sum, it) => sum + it.totalPrice, 0);
    const subtotal = totalLabor + totalParts;
    const discount = Math.max(0, data.discount || 0);
    const tax = Math.max(0, data.tax || 0);
    const grandTotal = Math.max(0, subtotal - discount + tax);

    const newWO: WorkOrder = {
      id: workOrderId,
      workshopId,
      workOrderNumber: number,
      bookingId: data.bookingId,
      customerId: data.customerId,
      vehicleId: data.vehicleId,
      odometerIn: data.odometerIn,
      customerComplaint: data.customerComplaint,
      inspectionFindings: data.inspectionFindings,
      status: "waiting",
      totalLabor,
      totalParts,
      subtotal,
      discount,
      tax,
      grandTotal,
      customerApprovalStatus: "pending",
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.workOrders.push(newWO);

    // If linked to booking, update booking status to in_service
    if (data.bookingId) {
      const bkg = store.bookings.find((b) => b.id === data.bookingId);
      if (bkg) bkg.status = "in_service";
    }

    // Update vehicle odometer if higher
    const vehicle = store.vehicles.find((v) => v.id === data.vehicleId);
    if (vehicle && data.odometerIn > vehicle.currentOdometer) {
      vehicle.currentOdometer = data.odometerIn;
    }

    return newWO;
  },

  /**
   * Safe Inventory Deduction: Only when work order status reaches 'in_progress' or parts usage is confirmed.
   * Every deduction records an immutable stock_movement and ensures stock cannot go negative.
   */
  deductWorkOrderParts(workshopId: string, workOrderId: string): void {
    const store = getStore();
    const wo = store.workOrders.find((w) => w.id === workOrderId && w.workshopId === workshopId);
    if (!wo) throw new Error("Work order tidak ditemukan.");

    const partItems = (wo.items || []).filter((it) => it.itemType === "part" && it.isApproved && !it.isPartsDeducted);

    for (const item of partItems) {
      if (!item.referenceId) continue;
      const product = store.products.find((p) => p.id === item.referenceId && p.workshopId === workshopId);
      if (!product) {
        throw new Error(`Produk spare part "${item.name}" tidak ditemukan di inventaris.`);
      }

      if (product.stockQuantity < item.quantity) {
        throw new Error(`Stok "${product.name}" tidak mencukupi (Tersedia: ${product.stockQuantity}, Dibutuhkan: ${item.quantity}).`);
      }

      const prevStock = product.stockQuantity;
      product.stockQuantity -= item.quantity;
      product.updatedAt = new Date().toISOString();
      item.isPartsDeducted = true;

      // Immutable Stock Movement Record
      const movement: StockMovement = {
        id: crypto.randomUUID(),
        workshopId,
        productId: product.id,
        productName: product.name,
        referenceType: "work_order",
        referenceId: wo.id,
        movementType: "out",
        quantity: item.quantity,
        previousStock: prevStock,
        currentStock: product.stockQuantity,
        unitCost: product.purchasePrice,
        notes: `Penggunaan suku cadang untuk SPK #${wo.workOrderNumber}`,
        createdAt: new Date().toISOString(),
      };
      store.stockMovements.push(movement);
    }
  },

  updateWorkOrderStatus(workshopId: string, id: string, status: WorkOrder["status"], notes?: string): WorkOrder {
    const store = getStore();
    const wo = store.workOrders.find((w) => w.id === id && w.workshopId === workshopId);
    if (!wo) throw new Error("Work order tidak ditemukan.");

    // If transitioning to in_progress or completed, ensure parts deduction is processed safely
    if ((status === "in_progress" || status === "completed") && wo.customerApprovalStatus === "approved") {
      this.deductWorkOrderParts(workshopId, id);
    }

    wo.status = status;
    if (notes) wo.finalNotes = notes;
    wo.updatedAt = new Date().toISOString();

    // If completed, automatically generate invoice and service history
    if (status === "completed") {
      this.generateInvoiceFromWorkOrder(workshopId, id);
    }

    return wo;
  },

  addWorkOrderItem(
    workshopId: string,
    workOrderId: string,
    item: {
      itemType: "service" | "part";
      name: string;
      quantity: number;
      unitPrice: number;
      referenceId?: string;
      isApproved?: boolean;
    }
  ): WorkOrder {
    const store = getStore();
    const wo = store.workOrders.find((w) => w.id === workOrderId && w.workshopId === workshopId);
    if (!wo) throw new Error("Work order tidak ditemukan.");

    const newItem: WorkOrderItem = {
      id: crypto.randomUUID(),
      workOrderId: wo.id,
      itemType: item.itemType,
      referenceId: item.referenceId,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
      isApproved: item.isApproved ?? true,
      isPartsDeducted: false,
      createdAt: new Date().toISOString(),
    };

    if (!wo.items) wo.items = [];
    wo.items.push(newItem);

    // Recalculate totals
    wo.totalLabor = wo.items
      .filter((it) => it.itemType === "service" && it.isApproved)
      .reduce((sum, it) => sum + it.totalPrice, 0);
    wo.totalParts = wo.items
      .filter((it) => it.itemType === "part" && it.isApproved)
      .reduce((sum, it) => sum + it.totalPrice, 0);
    wo.subtotal = wo.totalLabor + wo.totalParts;
    wo.grandTotal = Math.max(0, wo.subtotal - wo.discount + wo.tax);
    wo.updatedAt = new Date().toISOString();

    // If work order is already in_progress or completed and it's an approved part, deduct stock
    if ((wo.status === "in_progress" || wo.status === "completed") && newItem.isApproved) {
      this.deductWorkOrderParts(workshopId, wo.id);
    }

    // Also sync with invoice if one was already generated
    const inv = store.invoices.find((i) => i.workOrderId === wo.id);
    if (inv) {
      if (!inv.items) inv.items = [];
      inv.items.push({
        id: crypto.randomUUID(),
        invoiceId: inv.id,
        itemType: newItem.itemType,
        name: newItem.name,
        quantity: newItem.quantity,
        unitPrice: newItem.unitPrice,
        totalPrice: newItem.totalPrice,
        createdAt: new Date().toISOString(),
      });
      inv.subtotal = wo.subtotal;
      inv.totalAmount = wo.grandTotal;
      inv.updatedAt = new Date().toISOString();
    }

    return wo;
  },

  // ==========================================
  // INVENTORY & SPARE PARTS
  // ==========================================
  getProducts(workshopId: string, search = ""): Product[] {
    const query = search.toLowerCase().trim();
    return getStore()
      .products.filter((p) => p.workshopId === workshopId && p.isActive)
      .filter((p) => !query || p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query));
  },

  getProductById(workshopId: string, id: string): Product | undefined {
    return getStore().products.find((p) => p.id === id && p.workshopId === workshopId);
  },

  createProduct(workshopId: string, data: Omit<Product, "id" | "workshopId" | "createdAt" | "updatedAt" | "isActive">): Product {
    const store = getStore();
    const existingSku = store.products.find((p) => p.workshopId === workshopId && p.sku.toLowerCase() === data.sku.toLowerCase());
    if (existingSku) {
      throw new Error(`SKU "${data.sku}" sudah digunakan.`);
    }

    const newProduct: Product = {
      ...data,
      id: crypto.randomUUID(),
      workshopId,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.products.push(newProduct);

    // Initial stock movement if > 0
    if (newProduct.stockQuantity > 0) {
      store.stockMovements.push({
        id: crypto.randomUUID(),
        workshopId,
        productId: newProduct.id,
        productName: newProduct.name,
        referenceType: "adjustment",
        movementType: "in",
        quantity: newProduct.stockQuantity,
        previousStock: 0,
        currentStock: newProduct.stockQuantity,
        unitCost: newProduct.purchasePrice,
        notes: "Saldo stok awal pendaftaran produk",
        createdAt: new Date().toISOString(),
      });
    }

    return newProduct;
  },

  adjustStock(workshopId: string, productId: string, movementType: "in" | "out" | "adjustment", quantity: number, notes: string): Product {
    const store = getStore();
    const product = this.getProductById(workshopId, productId);
    if (!product) throw new Error("Produk tidak ditemukan.");

    const prevStock = product.stockQuantity;
    let nextStock = prevStock;

    if (movementType === "in") {
      nextStock = prevStock + quantity;
    } else if (movementType === "out") {
      if (prevStock < quantity) throw new Error(`Stok tidak mencukupi untuk pengurangan (Tersedia: ${prevStock}).`);
      nextStock = prevStock - quantity;
    } else {
      nextStock = quantity; // Absolute adjustment
    }

    product.stockQuantity = nextStock;
    product.updatedAt = new Date().toISOString();

    store.stockMovements.push({
      id: crypto.randomUUID(),
      workshopId,
      productId: product.id,
      productName: product.name,
      referenceType: "adjustment",
      movementType,
      quantity: Math.abs(nextStock - prevStock),
      previousStock: prevStock,
      currentStock: nextStock,
      unitCost: product.purchasePrice,
      notes,
      createdAt: new Date().toISOString(),
    });

    return product;
  },

  getStockMovements(workshopId: string, productId?: string): StockMovement[] {
    return getStore()
      .stockMovements.filter((sm) => sm.workshopId === workshopId)
      .filter((sm) => !productId || sm.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // ==========================================
  // SUPPLIERS & PURCHASES
  // ==========================================
  getSuppliers(workshopId: string): Supplier[] {
    return getStore().suppliers.filter((s) => s.workshopId === workshopId && s.isActive);
  },

  createSupplier(workshopId: string, data: Omit<Supplier, "id" | "workshopId" | "createdAt" | "isActive">): Supplier {
    const store = getStore();
    const newSupplier: Supplier = {
      ...data,
      id: crypto.randomUUID(),
      workshopId,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    store.suppliers.push(newSupplier);
    return newSupplier;
  },

  getPurchases(workshopId: string): Purchase[] {
    return getStore()
      .purchases.filter((p) => p.workshopId === workshopId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createPurchase(workshopId: string, supplierId: string, items: { productId: string; quantity: number; unitCost: number }[], notes?: string): Purchase {
    const store = getStore();
    const supplier = store.suppliers.find((s) => s.id === supplierId && s.workshopId === workshopId);
    if (!supplier) throw new Error("Supplier tidak ditemukan.");

    const purchaseId = crypto.randomUUID();
    const purchaseNumber = `PO-${new Date().toISOString().slice(2, 4)}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(store.purchases.length + 1).padStart(4, "0")}`;

    const purchaseItems = items.map((it) => {
      const prod = store.products.find((p) => p.id === it.productId);
      return {
        id: crypto.randomUUID(),
        purchaseId,
        productId: it.productId,
        productName: prod ? prod.name : "Produk",
        quantity: it.quantity,
        unitCost: it.unitCost,
        totalCost: it.quantity * it.unitCost,
        isReceived: false,
      };
    });

    const totalAmount = purchaseItems.reduce((sum, it) => sum + it.totalCost, 0);

    const newPurchase: Purchase = {
      id: purchaseId,
      workshopId,
      supplierId,
      supplierName: supplier.name,
      purchaseNumber,
      purchaseDate: new Date().toISOString().split("T")[0],
      totalAmount,
      status: "draft",
      notes,
      items: purchaseItems,
      createdAt: new Date().toISOString(),
    };

    store.purchases.push(newPurchase);
    return newPurchase;
  },

  receivePurchaseGoods(workshopId: string, purchaseId: string): Purchase {
    const store = getStore();
    const purchase = store.purchases.find((p) => p.id === purchaseId && p.workshopId === workshopId);
    if (!purchase) throw new Error("Purchase order tidak ditemukan.");
    if (purchase.status === "received") throw new Error("Barang untuk PO ini sudah diterima sebelumnya.");

    // Increase stock for each item and write stock movement
    for (const it of purchase.items || []) {
      const prod = store.products.find((p) => p.id === it.productId && p.workshopId === workshopId);
      if (prod) {
        const prevStock = prod.stockQuantity;
        prod.stockQuantity += it.quantity;
        // Update purchase price with moving average or latest cost
        prod.purchasePrice = it.unitCost;
        prod.updatedAt = new Date().toISOString();
        it.isReceived = true;

        store.stockMovements.push({
          id: crypto.randomUUID(),
          workshopId,
          productId: prod.id,
          productName: prod.name,
          referenceType: "purchase",
          referenceId: purchase.id,
          movementType: "in",
          quantity: it.quantity,
          previousStock: prevStock,
          currentStock: prod.stockQuantity,
          unitCost: it.unitCost,
          notes: `Penerimaan barang PO #${purchase.purchaseNumber}`,
          createdAt: new Date().toISOString(),
        });
      }
    }

    purchase.status = "received";
    return purchase;
  },

  // ==========================================
  // INVOICES & PAYMENTS
  // ==========================================
  getInvoices(workshopId: string): Invoice[] {
    return getStore()
      .invoices.filter((inv) => inv.workshopId === workshopId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getInvoiceById(workshopId: string, id: string): Invoice | undefined {
    const inv = getStore().invoices.find((i) => i.id === id && i.workshopId === workshopId);
    if (!inv) return undefined;
    return {
      ...inv,
      payments: getStore().payments.filter((p) => p.invoiceId === inv.id),
    };
  },

  generateInvoiceFromWorkOrder(workshopId: string, workOrderId: string): Invoice {
    const store = getStore();
    const wo = this.getWorkOrderById(workshopId, workOrderId);
    if (!wo) throw new Error("Work order tidak ditemukan.");

    // Check if invoice already exists
    const existing = store.invoices.find((i) => i.workOrderId === workOrderId);
    if (existing) return existing;

    const customer = store.customers.find((c) => c.id === wo.customerId);
    const invoiceId = crypto.randomUUID();
    const invoiceNumber = `INV-${new Date().toISOString().slice(2, 4)}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(store.invoices.length + 1).padStart(4, "0")}`;

    const invoiceItems = (wo.items || []).filter((it) => it.isApproved).map((it) => ({
      id: crypto.randomUUID(),
      invoiceId,
      itemType: it.itemType,
      name: it.name,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      totalPrice: it.totalPrice,
      createdAt: new Date().toISOString(),
    }));

    const newInvoice: Invoice = {
      id: invoiceId,
      workshopId,
      invoiceNumber,
      workOrderId: wo.id,
      customerId: wo.customerId,
      customerName: customer ? customer.fullName : "Pelanggan",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
      subtotal: wo.subtotal,
      discount: wo.discount,
      taxRate: 0,
      taxAmount: wo.tax,
      totalAmount: wo.grandTotal,
      paidAmount: 0,
      status: "unpaid",
      notes: `Faktur servis otomatis dari SPK #${wo.workOrderNumber}`,
      items: invoiceItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.invoices.push(newInvoice);

    // Save Service History
    const vehicle = store.vehicles.find((v) => v.id === wo.vehicleId);
    const partsNames = invoiceItems.filter((i) => i.itemType === "part").map((i) => i.name).join(", ");
    const serviceNames = invoiceItems.filter((i) => i.itemType === "service").map((i) => i.name).join(", ");

    store.serviceHistories.push({
      id: crypto.randomUUID(),
      workshopId,
      vehicleId: wo.vehicleId,
      customerId: wo.customerId,
      workOrderId: wo.id,
      invoiceId: newInvoice.id,
      serviceDate: newInvoice.invoiceDate,
      odometer: wo.odometerIn,
      complaint: wo.customerComplaint,
      findings: wo.inspectionFindings || "Pemeriksaan rutin",
      workCompleted: serviceNames || "Servis berkala",
      partsReplaced: partsNames || "-",
      totalCost: newInvoice.totalAmount,
      nextMaintenanceOdometer: wo.odometerIn + 4000,
      nextMaintenanceDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      reminderStatus: "pending",
      createdAt: new Date().toISOString(),
    });

    return newInvoice;
  },

  createDirectInvoice(workshopId: string, data: {
    customerId: string;
    customerName?: string;
    workOrderId?: string;
    items: {
      itemType: "service" | "part";
      name: string;
      quantity: number;
      unitPrice: number;
      referenceId?: string;
    }[];
    discount?: number;
    tax?: number;
    notes?: string;
  }): Invoice {
    const store = getStore();
    const customer = store.customers.find((c) => c.id === data.customerId && c.workshopId === workshopId);
    const invoiceId = crypto.randomUUID();
    const invoiceNumber = `INV-${new Date().toISOString().slice(2, 4)}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(store.invoices.length + 1).padStart(4, "0")}`;

    const invoiceItems = data.items.map((it) => {
      // If item is part and has referenceId, deduct stock and write movement
      if (it.itemType === "part" && it.referenceId) {
        const product = store.products.find((p) => p.id === it.referenceId && p.workshopId === workshopId);
        if (product) {
          if (product.stockQuantity < it.quantity) {
            throw new Error(`Stok "${product.name}" tidak mencukupi (Tersedia: ${product.stockQuantity}).`);
          }
          const prevStock = product.stockQuantity;
          product.stockQuantity -= it.quantity;
          product.updatedAt = new Date().toISOString();

          store.stockMovements.push({
            id: crypto.randomUUID(),
            workshopId,
            productId: product.id,
            productName: product.name,
            referenceType: "invoice",
            referenceId: invoiceId,
            movementType: "out",
            quantity: it.quantity,
            previousStock: prevStock,
            currentStock: product.stockQuantity,
            unitCost: product.purchasePrice,
            notes: `Penjualan langsung via Faktur #${invoiceNumber}`,
            createdAt: new Date().toISOString(),
          });
        }
      }

      return {
        id: crypto.randomUUID(),
        invoiceId,
        itemType: it.itemType,
        name: it.name,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.quantity * it.unitPrice,
        createdAt: new Date().toISOString(),
      };
    });

    const subtotal = invoiceItems.reduce((sum, it) => sum + it.totalPrice, 0);
    const discount = Math.max(0, data.discount || 0);
    const tax = Math.max(0, data.tax || 0);
    const totalAmount = Math.max(0, subtotal - discount + tax);

    const newInvoice: Invoice = {
      id: invoiceId,
      workshopId,
      invoiceNumber,
      workOrderId: data.workOrderId,
      customerId: data.customerId,
      customerName: data.customerName || (customer ? customer.fullName : "Pelanggan"),
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
      subtotal,
      discount,
      taxRate: 0,
      taxAmount: tax,
      totalAmount,
      paidAmount: 0,
      status: "unpaid",
      notes: data.notes || `Faktur kasir langsung #${invoiceNumber}`,
      items: invoiceItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.invoices.push(newInvoice);
    return newInvoice;
  },

  recordPayment(workshopId: string, data: {
    invoiceId: string;
    amount: number;
    paymentMethod: Payment["paymentMethod"];
    notes?: string;
    externalReference?: string;
    idempotencyKey?: string;
  }): Payment {
    const store = getStore();
    const invoice = store.invoices.find((i) => i.id === data.invoiceId && i.workshopId === workshopId);
    if (!invoice) throw new Error("Invoice tidak ditemukan.");

    // Idempotency check: prevent double payment callback processing
    if (data.idempotencyKey) {
      const existingPayment = store.payments.find((p) => p.idempotencyKey === data.idempotencyKey);
      if (existingPayment) return existingPayment;
    }

    const remainingDue = invoice.totalAmount - invoice.paidAmount;
    if (data.amount > remainingDue) {
      throw new Error(`Nominal pembayaran (Rp ${data.amount.toLocaleString()}) melebihi sisa tagihan (Rp ${remainingDue.toLocaleString()}).`);
    }

    const paymentNumber = `PAY-${new Date().toISOString().slice(2, 4)}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(store.payments.length + 1).padStart(4, "0")}`;

    const payment: Payment = {
      id: crypto.randomUUID(),
      workshopId,
      invoiceId: invoice.id,
      paymentNumber,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentDate: new Date().toISOString(),
      externalReference: data.externalReference,
      status: "success",
      notes: data.notes,
      idempotencyKey: data.idempotencyKey,
      createdAt: new Date().toISOString(),
    };

    store.payments.push(payment);

    // Update invoice paid amount and status
    invoice.paidAmount += data.amount;
    if (invoice.paidAmount >= invoice.totalAmount) {
      invoice.status = "paid";
    } else {
      invoice.status = "partially_paid";
    }
    invoice.updatedAt = new Date().toISOString();

    return payment;
  },

  // ==========================================
  // EXPENSES
  // ==========================================
  getExpenses(workshopId: string): Expense[] {
    return getStore()
      .expenses.filter((e) => e.workshopId === workshopId)
      .sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());
  },

  createExpense(workshopId: string, data: Omit<Expense, "id" | "workshopId" | "createdAt">): Expense {
    const store = getStore();
    const expense: Expense = {
      ...data,
      id: crypto.randomUUID(),
      workshopId,
      createdAt: new Date().toISOString(),
    };
    store.expenses.push(expense);
    return expense;
  },

  // ==========================================
  // MECHANICS
  // ==========================================
  getMechanics(workshopId: string): Mechanic[] {
    return getStore().mechanics.filter((m) => m.workshopId === workshopId);
  },

  createMechanic(workshopId: string, data: Omit<Mechanic, "id" | "workshopId" | "createdAt" | "activeJobsCount" | "completedJobsCount">): Mechanic {
    const store = getStore();
    const newMechanic: Mechanic = {
      ...data,
      id: crypto.randomUUID(),
      workshopId,
      activeJobsCount: 0,
      completedJobsCount: 0,
      createdAt: new Date().toISOString(),
    };
    store.mechanics.push(newMechanic);
    return newMechanic;
  },

  // ==========================================
  // FINANCIAL REPORTS & ANALYTICS
  // ==========================================
  getFinancialSummary(workshopId: string) {
    const store = getStore();

    // Only confirmed payments count towards cash revenue
    const payments = store.payments.filter((p) => p.workshopId === workshopId && p.status === "success");
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // Service vs Parts Revenue reconciliation from paid invoices
    const paidInvoices = store.invoices.filter((i) => i.workshopId === workshopId && (i.status === "paid" || i.status === "partially_paid"));
    let serviceRevenue = 0;
    let partsRevenue = 0;

    for (const inv of paidInvoices) {
      for (const it of inv.items || []) {
        if (it.itemType === "service") serviceRevenue += it.totalPrice;
        if (it.itemType === "part") partsRevenue += it.totalPrice;
      }
    }

    // Cost of Goods Sold (COGS) from stock movements of type 'out' for work orders
    const stockOut = store.stockMovements.filter((sm) => sm.workshopId === workshopId && sm.movementType === "out");
    const cogs = stockOut.reduce((sum, sm) => sum + sm.quantity * sm.unitCost, 0);

    // Operating Expenses
    const expenses = store.expenses.filter((e) => e.workshopId === workshopId);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const grossProfit = totalRevenue - cogs;
    const netProfit = grossProfit - totalExpenses;

    const totalCustomers = store.customers.filter((c) => c.workshopId === workshopId && !c.isArchived).length;
    const totalVehicles = store.vehicles.filter((v) => v.workshopId === workshopId && !v.isArchived).length;
    const pendingBookings = store.bookings.filter((b) => b.workshopId === workshopId && b.status === "pending").length;
    const activeWorkOrders = store.workOrders.filter(
      (wo) => wo.workshopId === workshopId && ["waiting", "inspection", "waiting_approval", "in_progress", "waiting_parts"].includes(wo.status)
    ).length;
    const completedServices = store.workOrders.filter((wo) => wo.workshopId === workshopId && ["completed", "delivered"].includes(wo.status)).length;
    const lowStockCount = store.products.filter((p) => p.workshopId === workshopId && p.isActive && p.stockQuantity <= p.minStock).length;

    return {
      totalRevenue,
      serviceRevenue,
      partsRevenue,
      cogs,
      grossProfit,
      totalExpenses,
      netProfit,
      totalCustomers,
      totalVehicles,
      pendingBookings,
      activeWorkOrders,
      completedServices,
      lowStockCount,
    };
  },

  // ==========================================
  // SERVICE HISTORIES
  // ==========================================
  getServiceHistories(workshopId: string, vehicleId?: string): ServiceHistory[] {
    return getStore()
      .serviceHistories.filter((sh) => sh.workshopId === workshopId)
      .filter((sh) => !vehicleId || sh.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
  },

  // ==========================================
  // SUBSCRIPTIONS
  // ==========================================
  getSubscription(workshopId: string): Subscription | undefined {
    return getStore().subscriptions.find((s) => s.workshopId === workshopId);
  },

  upgradeSubscription(workshopId: string, planCode: Subscription["planCode"]): Subscription {
    const store = getStore();
    let sub = store.subscriptions.find((s) => s.workshopId === workshopId);
    const prices: Record<Subscription["planCode"], number> = {
      free: 0,
      basic: 49000,
      pro: 99000,
      business: 199000,
    };
    const maxStaffs: Record<Subscription["planCode"], number> = {
      free: 2,
      basic: 3,
      pro: 10,
      business: 25,
    };

    if (!sub) {
      sub = {
        id: crypto.randomUUID(),
        workshopId,
        planCode,
        status: "active",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        priceMonthly: prices[planCode],
        maxStaff: maxStaffs[planCode],
        maxWorkOrdersPerMonth: planCode === "free" ? 30 : 9999,
        hasAi: planCode === "pro" || planCode === "business",
        hasMultiBranch: planCode === "business",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.subscriptions.push(sub);
    } else {
      sub.planCode = planCode;
      sub.priceMonthly = prices[planCode];
      sub.maxStaff = maxStaffs[planCode];
      sub.maxWorkOrdersPerMonth = planCode === "free" ? 30 : 9999;
      sub.hasAi = planCode === "pro" || planCode === "business";
      sub.hasMultiBranch = planCode === "business";
      sub.updatedAt = new Date().toISOString();
    }

    return sub;
  },

  // ==========================================
  // SUPER ADMIN PLATFORM AUDIT & METRICS
  // ==========================================
  getPlatformMetrics() {
    const store = getStore();
    const totalWorkshops = store.workshops.length;
    const approvedWorkshops = store.workshops.filter((w) => w.status === "approved").length;
    const pendingWorkshops = store.workshops.filter((w) => w.status === "pending").length;
    const totalUsers = store.profiles.length;
    const activeSubscriptions = store.subscriptions.filter((s) => s.status === "active" && s.planCode !== "free").length;
    const platformMonthlyRevenue = store.subscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + s.priceMonthly, 0);

    return {
      totalWorkshops,
      approvedWorkshops,
      pendingWorkshops,
      totalUsers,
      activeSubscriptions,
      platformMonthlyRevenue,
    };
  },
};
