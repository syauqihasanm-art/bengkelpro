import { NextResponse } from "next/server";
import {
  db,
  getStoreSnapshot,
  getStoreVersion,
  bumpStoreVersion,
  replaceStoreSnapshot,
} from "@/lib/db";
import { hydrateRuntimeStore, persistRuntimeStore } from "@/lib/persistence";
import { createAdminClient } from "@/lib/supabase";
import {
  bookingSchema,
  customerSchema,
  expenseSchema,
  mechanicSchema,
  paymentSchema,
  productSchema,
  purchaseOrderSchema,
  registerWorkshopSchema,
  stockAdjustmentSchema,
  supplierSchema,
  vehicleSchema,
  workOrderSchema,
} from "@/schemas";
import { WorkOrderStatus } from "@/types";

const DEFAULT_WORKSHOP_ID = "11111111-1111-4111-8111-111111111111";

function isMidtransConfigured(): boolean {
  const key = process.env.MIDTRANS_SERVER_KEY || "";
  return Boolean(key) && !key.includes("your-midtrans");
}

async function ensureHydrated(): Promise<void> {
  await hydrateRuntimeStore(getStoreVersion, replaceStoreSnapshot);
}

async function commitPersistence(): Promise<void> {
  const nextVersion = bumpStoreVersion();
  await persistRuntimeStore(getStoreSnapshot(), nextVersion);
}

function zodOrMessage(err: any, fallback: string) {
  if (err?.errors) {
    return NextResponse.json({ error: err.errors[0]?.message || "Validasi gagal" }, { status: 400 });
  }
  return NextResponse.json({ error: err?.message || fallback }, { status: 400 });
}

export async function dispatchApiRequest(
  req: Request,
  slugSegments: string[]
): Promise<Response> {
  const route = slugSegments.join("/").toLowerCase();
  const method = req.method.toUpperCase();

  await ensureHydrated();

  try {
    switch (route) {
      case "health": {
        if (method !== "GET") {
          return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
        }
        const startTime = Date.now();
        let dbStatus = "healthy";
        try {
          const workshops = db.getWorkshops();
          if (!Array.isArray(workshops)) dbStatus = "degraded";
        } catch {
          dbStatus = "unreachable";
        }
        const responseTimeMs = Date.now() - startTime;
        const isHealthy = dbStatus === "healthy";
        return NextResponse.json(
          {
            status: isHealthy ? "ok" : "degraded",
            health: isHealthy ? "healthy" : "degraded",
            application: "BengkelPro",
            timestamp: new Date().toISOString(),
            service: "BengkelPro Workshop Management System",
            version: "1.0.0",
            environment: process.env.NODE_ENV || "development",
            uptime: process.uptime ? Math.floor(process.uptime()) : 0,
            checks: {
              database: dbStatus,
              api: "healthy",
              persistence: createAdminClient() ? "supabase" : "snapshot",
              qrisGatewayConfigured: isMidtransConfigured(),
            },
            responseTimeMs,
          },
          {
            status: isHealthy ? 200 : 503,
            headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
          }
        );
      }

      case "work-orders": {
        if (method === "GET") {
          const { searchParams } = new URL(req.url);
          const id = searchParams.get("id");
          const status = (searchParams.get("status") as WorkOrderStatus) || undefined;
          const mechanicId = searchParams.get("mechanicId") || undefined;
          const customerId = searchParams.get("customerId") || undefined;
          const workshopId = searchParams.get("workshopId") || DEFAULT_WORKSHOP_ID;

          if (id) {
            const wo = db.getWorkOrderById(workshopId, id);
            if (!wo) return NextResponse.json({ error: "Work order tidak ditemukan" }, { status: 404 });
            return NextResponse.json({ workOrder: wo });
          }

          let workOrders = db.getWorkOrders(workshopId, status);
          if (mechanicId) {
            workOrders = workOrders.filter((wo) =>
              (wo.assignedMechanics || []).some((m) => m.id === mechanicId || m.userId === mechanicId) ||
              wo.completedByMechanicId === mechanicId
            );
          }
          if (customerId) {
            workOrders = workOrders.filter((wo) => wo.customerId === customerId);
          }

          return NextResponse.json({ workOrders });
        }

        if (method === "POST") {
          const body = await req.json();
          const validated = workOrderSchema.parse(body);
          const workshopId = body.workshopId || DEFAULT_WORKSHOP_ID;

          const newWO = db.createWorkOrder(workshopId, {
            bookingId: validated.bookingId || undefined,
            customerId: validated.customerId,
            vehicleId: validated.vehicleId,
            odometerIn: validated.odometerIn,
            customerComplaint: validated.customerComplaint,
            inspectionFindings: validated.inspectionFindings,
            items: validated.items.map((it) => ({
              itemType: it.itemType,
              referenceId: it.referenceId,
              name: it.name,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              isApproved: it.isApproved,
            })),
            discount: validated.discount,
            tax: validated.tax,
            assignedMechanicIds: validated.assignedMechanicIds,
          });

          await commitPersistence();
          return NextResponse.json({ workOrder: newWO }, { status: 201 });
        }

        if (method === "PATCH") {
          const body = await req.json();
          const {
            id,
            action,
            mechanicId,
            status,
            notes,
            workResult,
            workshopId = DEFAULT_WORKSHOP_ID,
            customerApprovalStatus,
            inspectionFindings,
            addItem,
            autoSettle,
            assignedMechanicIds,
          } = body;

          if (!id) {
            return NextResponse.json({ error: "ID SPK wajib disertakan" }, { status: 400 });
          }

          const existing = db.getWorkOrderById(workshopId, id);
          if (!existing) {
            return NextResponse.json({ error: "Work order tidak ditemukan" }, { status: 404 });
          }

          if (action === "mechanic_complete") {
            if (!mechanicId) {
              return NextResponse.json(
                { error: "Identitas mekanik (mechanicId) wajib disertakan untuk menyelesaikan pekerjaan." },
                { status: 400 }
              );
            }
            const completed = db.completeWorkOrderByMechanic(workshopId, id, {
              mechanicId,
              inspectionFindings,
              workResult: workResult ?? notes,
              notes,
            });
            await commitPersistence();
            return NextResponse.json({
              workOrder: completed,
              message: "Pekerjaan berhasil diselesaikan dan otomatis masuk ke antrean Admin/Kasir.",
            });
          }

          if (Array.isArray(assignedMechanicIds)) {
            db.assignMechanicsToWorkOrder(workshopId, id, assignedMechanicIds);
          }

          // Update findings/approval directly if changed outside status transition
          const store = getStoreSnapshot();
          const rawWo = store.workOrders.find((w) => w.id === id && w.workshopId === workshopId);
          if (rawWo) {
            if (customerApprovalStatus) {
              rawWo.customerApprovalStatus = customerApprovalStatus;
              if (customerApprovalStatus === "approved" && !rawWo.approvedAt) {
                rawWo.approvedAt = new Date().toISOString();
              }
            }
            if (inspectionFindings !== undefined) {
              rawWo.inspectionFindings = inspectionFindings;
              rawWo.updatedAt = new Date().toISOString();
            }
            if (workResult !== undefined) {
              rawWo.workResult = workResult;
              rawWo.finalNotes = workResult;
              rawWo.updatedAt = new Date().toISOString();
            }
          }

          if (addItem) {
            db.addWorkOrderItem(workshopId, id, addItem);
          }

          if (status) {
            db.updateWorkOrderStatus(workshopId, id, status, notes, Boolean(autoSettle));
          }

          const updated = db.getWorkOrderById(workshopId, id);
          const invoices = db.getInvoices(workshopId);
          const invoice = invoices.find((inv) => inv.workOrderId === id);

          await commitPersistence();
          return NextResponse.json({ workOrder: updated || existing, invoice });
        }

        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
      }

      case "invoices": {
        if (method === "GET") {
          const { searchParams } = new URL(req.url);
          const id = searchParams.get("id");
          const customerId = searchParams.get("customerId") || undefined;
          const workshopId = searchParams.get("workshopId") || DEFAULT_WORKSHOP_ID;

          if (id) {
            const invoice = db.getInvoiceById(workshopId, id);
            if (!invoice) return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
            return NextResponse.json({
              invoice,
              qrisGatewayConfigured: isMidtransConfigured(),
            });
          }

          let invoices = db.getInvoices(workshopId);
          if (customerId) {
            invoices = invoices.filter((inv) => inv.customerId === customerId);
          }
          return NextResponse.json({
            invoices,
            qrisGatewayConfigured: isMidtransConfigured(),
          });
        }

        if (method === "POST") {
          const body = await req.json();
          const workshopId = body.workshopId || DEFAULT_WORKSHOP_ID;

          if (body.action === "create" || body.workOrderId || (body.items && body.items.length > 0)) {
            if (body.workOrderId) {
              const inv = db.generateInvoiceFromWorkOrder(workshopId, body.workOrderId);
              const wo = db.getWorkOrderById(workshopId, body.workOrderId);
              await commitPersistence();
              return NextResponse.json({ invoice: inv, workOrder: wo }, { status: 201 });
            }

            if (body.items) {
              const inv = db.createDirectInvoice(workshopId, {
                customerId: body.customerId,
                customerName: body.customerName,
                items: body.items,
                discount: body.discount,
                tax: body.tax,
                notes: body.notes,
              });
              await commitPersistence();
              return NextResponse.json({ invoice: inv }, { status: 201 });
            }
          }

          const validated = paymentSchema.parse(body);

          if (
            (validated.paymentMethod === "qris" || validated.paymentMethod === "bank_transfer") &&
            !validated.externalReference?.trim()
          ) {
            return NextResponse.json(
              {
                error:
                  "Untuk pembayaran QRIS atau Transfer Bank, masukkan nomor referensi / RRN bukti transaksi yang telah terverifikasi.",
              },
              { status: 400 }
            );
          }

          if (validated.paymentMethod === "qris" && body.qrisConfirmed === false) {
            return NextResponse.json(
              { error: "Konfirmasi terlebih dahulu bahwa dana QRIS sudah masuk ke rekening merchant." },
              { status: 400 }
            );
          }

          const payment = db.recordPayment(workshopId, {
            invoiceId: validated.invoiceId,
            amount: validated.amount,
            paymentMethod: validated.paymentMethod,
            notes: validated.notes,
            externalReference: validated.externalReference?.trim(),
            verifiedBy: body.verifiedBy || "Kasir / Admin Bengkel",
            idempotencyKey: body.idempotencyKey,
          });

          const updatedInvoice = db.getInvoiceById(workshopId, validated.invoiceId);
          const updatedWO = updatedInvoice?.workOrderId
            ? db.getWorkOrderById(workshopId, updatedInvoice.workOrderId)
            : undefined;

          await commitPersistence();
          return NextResponse.json(
            { payment, invoice: updatedInvoice, workOrder: updatedWO },
            { status: 201 }
          );
        }

        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
      }

      case "reports": {
        if (method !== "GET") {
          return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
        }
        const { searchParams } = new URL(req.url);
        const workshopId = searchParams.get("workshopId") || DEFAULT_WORKSHOP_ID;
        const summary = db.getFinancialSummary(workshopId);
        return NextResponse.json({ summary });
      }

      case "service-history": {
        if (method !== "GET") {
          return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
        }
        const { searchParams } = new URL(req.url);
        const workshopId = searchParams.get("workshopId") || DEFAULT_WORKSHOP_ID;
        const vehicleId = searchParams.get("vehicleId") || undefined;
        const customerId = searchParams.get("customerId") || undefined;

        let rawHistories = db.getServiceHistories(workshopId, vehicleId);
        if (customerId) {
          rawHistories = rawHistories.filter((h) => h.customerId === customerId);
        }

        const invoices = db.getInvoices(workshopId);
        const workOrders = db.getWorkOrders(workshopId);

        const histories = rawHistories.map((h) => {
          const vehicle = db.getVehicleById(workshopId, h.vehicleId);
          const wo = workOrders.find((w) => w.id === h.workOrderId);
          const inv = invoices.find((i) => i.id === h.invoiceId || i.workOrderId === h.workOrderId);
          const vehicleName = vehicle
            ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})`
            : "Kendaraan Bermotor";
          return {
            ...h,
            vehicleName,
            workOrderNumber: wo?.workOrderNumber,
            workOrderStatus: wo?.status,
            mechanicName: wo?.completedByMechanicName || wo?.assignedMechanics?.[0]?.name,
            invoiceNumber: inv?.invoiceNumber,
            invoiceStatus: inv?.status,
          };
        });

        return NextResponse.json({ histories });
      }

      case "inventory": {
        if (method === "GET") {
          const { searchParams } = new URL(req.url);
          const search = searchParams.get("search") || "";
          const includeMovements = searchParams.get("includeMovements") === "true";
          const productId = searchParams.get("productId") || undefined;
          const workshopId = searchParams.get("workshopId") || DEFAULT_WORKSHOP_ID;

          const products = db.getProducts(workshopId, search);
          const movements = includeMovements ? db.getStockMovements(workshopId, productId) : [];
          return NextResponse.json({ products, movements });
        }

        if (method === "POST") {
          const body = await req.json();
          const workshopId = body.workshopId || DEFAULT_WORKSHOP_ID;

          if (body.action === "adjust") {
            const validated = stockAdjustmentSchema.parse(body);
            const updatedProduct = db.adjustStock(
              workshopId,
              validated.productId,
              validated.movementType,
              validated.quantity,
              validated.notes
            );
            await commitPersistence();
            return NextResponse.json({ product: updatedProduct });
          }

          const validated = productSchema.parse(body);
          const newProduct = db.createProduct(workshopId, {
            sku: validated.sku.toUpperCase(),
            name: validated.name,
            brand: validated.brand,
            categoryId: validated.categoryId || undefined,
            purchasePrice: validated.purchasePrice,
            sellingPrice: validated.sellingPrice,
            stockQuantity: validated.stockQuantity,
            minStock: validated.minStock,
            unit: validated.unit,
          });
          await commitPersistence();
          return NextResponse.json({ product: newProduct }, { status: 201 });
        }

        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
      }

      case "mechanics": {
        if (method === "GET") {
          const { searchParams } = new URL(req.url);
          const workshopId = searchParams.get("workshopId") || DEFAULT_WORKSHOP_ID;
          const mechanics = db.getMechanics(workshopId);
          return NextResponse.json({ mechanics });
        }

        if (method === "POST") {
          const body = await req.json();
          const validated = mechanicSchema.parse(body);
          const workshopId = body.workshopId || DEFAULT_WORKSHOP_ID;
          const mechanic = db.createMechanic(workshopId, {
            name: validated.name,
            phone: validated.phone,
            specialization: validated.specialization,
            status: validated.status,
            rating: 5.0,
          });
          await commitPersistence();
          return NextResponse.json({ mechanic }, { status: 201 });
        }

        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
      }

      case "customers": {
        if (method === "GET") {
          const { searchParams } = new URL(req.url);
          const search = searchParams.get("search") || "";
          const workshopId = searchParams.get("workshopId") || DEFAULT_WORKSHOP_ID;
          return NextResponse.json({ customers: db.getCustomers(workshopId, search) });
        }
        if (method === "POST") {
          const body = await req.json();
          const validated = customerSchema.parse(body);
          const workshopId = body.workshopId || DEFAULT_WORKSHOP_ID;
          const newCustomer = db.createCustomer(workshopId, {
            fullName: validated.fullName,
            phone: validated.phone,
            email: validated.email || undefined,
            address: validated.address || undefined,
            notes: validated.notes || undefined,
          });
          await commitPersistence();
          return NextResponse.json({ customer: newCustomer }, { status: 201 });
        }
        if (method === "PUT") {
          const body = await req.json();
          const { id, workshopId = DEFAULT_WORKSHOP_ID, ...updates } = body;
          if (!id) return NextResponse.json({ error: "ID pelanggan diperlukan" }, { status: 400 });
          const updated = db.updateCustomer(workshopId, id, updates);
          await commitPersistence();
          return NextResponse.json({ customer: updated });
        }
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
      }

      case "vehicles": {
        if (method === "GET") {
          const { searchParams } = new URL(req.url);
          const search = searchParams.get("search") || "";
          const customerId = searchParams.get("customerId") || undefined;
          const workshopId = searchParams.get("workshopId") || DEFAULT_WORKSHOP_ID;
          return NextResponse.json({ vehicles: db.getVehicles(workshopId, customerId, search) });
        }
        if (method === "POST") {
          const body = await req.json();
          const validated = vehicleSchema.parse(body);
          const workshopId = body.workshopId || DEFAULT_WORKSHOP_ID;
          const newVehicle = db.createVehicle(workshopId, {
            customerId: validated.customerId,
            vehicleType: validated.vehicleType,
            brand: validated.brand,
            model: validated.model,
            productionYear: validated.productionYear,
            licensePlate: validated.licensePlate,
            chassisNumber: validated.chassisNumber,
            engineNumber: validated.engineNumber,
            currentOdometer: validated.currentOdometer,
            notes: validated.notes,
          });
          await commitPersistence();
          return NextResponse.json({ vehicle: newVehicle }, { status: 201 });
        }
        if (method === "PUT") {
          const body = await req.json();
          const { id, workshopId = DEFAULT_WORKSHOP_ID, ...updates } = body;
          if (!id) return NextResponse.json({ error: "ID kendaraan diperlukan" }, { status: 400 });
          const updated = db.updateVehicle(workshopId, id, updates);
          await commitPersistence();
          return NextResponse.json({ vehicle: updated });
        }
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
      }

      case "bookings": {
        if (method === "GET") {
          const { searchParams } = new URL(req.url);
          const date = searchParams.get("date") || undefined;
          const workshopId = searchParams.get("workshopId") || DEFAULT_WORKSHOP_ID;
          return NextResponse.json({ bookings: db.getBookings(workshopId, date) });
        }
        if (method === "POST") {
          const body = await req.json();
          const validated = bookingSchema.parse(body);
          const booking = db.createBooking(validated.workshopId, {
            customerId: validated.customerId,
            vehicleId: validated.vehicleId,
            serviceDate: validated.serviceDate,
            timeSlot: validated.timeSlot,
            customerComplaint: validated.customerComplaint,
            estimatedCost: 0,
            adminNotes: "Booking dibuat oleh Admin Bengkel",
          });
          await commitPersistence();
          return NextResponse.json({ booking }, { status: 201 });
        }
        if (method === "PATCH") {
          const body = await req.json();
          const { id, status, notes, workshopId = DEFAULT_WORKSHOP_ID } = body;
          if (!id || !status) {
            return NextResponse.json({ error: "ID dan status wajib disertakan" }, { status: 400 });
          }
          const updated = db.updateBookingStatus(workshopId, id, status, notes);
          await commitPersistence();
          return NextResponse.json({ booking: updated });
        }
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
      }

      case "bookings/public": {
        if (method !== "POST") {
          return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
        }
        const body = await req.json();
        const {
          workshopSlug,
          fullName,
          phone,
          vehicleType,
          brand,
          model,
          licensePlate,
          serviceDate,
          timeSlot,
          complaint,
        } = body;

        if (!workshopSlug || !fullName || !phone || !brand || !model || !licensePlate || !serviceDate || !timeSlot || !complaint) {
          return NextResponse.json({ error: "Seluruh kolom wajib diisi." }, { status: 400 });
        }

        const workshop = db.getWorkshopBySlug(workshopSlug);
        if (!workshop) {
          return NextResponse.json({ error: "Bengkel tidak ditemukan." }, { status: 404 });
        }

        const customers = db.getCustomers(workshop.id);
        let customer = customers.find((c) => c.phone === phone);
        if (!customer) {
          customer = db.createCustomer(workshop.id, {
            fullName,
            phone,
            email: "",
            address: "",
            notes: "Didaftarkan otomatis melalui booking publik online",
          });
        }

        const vehicles = db.getVehicles(workshop.id, customer.id);
        let vehicle = vehicles.find((v) => v.licensePlate === licensePlate.toUpperCase().trim());
        if (!vehicle) {
          vehicle = db.createVehicle(workshop.id, {
            customerId: customer.id,
            vehicleType: (vehicleType as any) || "motor",
            brand,
            model,
            licensePlate: licensePlate.toUpperCase().trim(),
            currentOdometer: 0,
            notes: "Ditambahkan melalui booking online",
          });
        }

        const booking = db.createBooking(workshop.id, {
          customerId: customer.id,
          vehicleId: vehicle.id,
          serviceDate,
          timeSlot,
          customerComplaint: complaint,
          estimatedCost: 0,
          adminNotes: "Booking online via web publik",
        });

        await commitPersistence();
        return NextResponse.json(
          {
            success: true,
            message: "Booking berhasil dibuat.",
            bookingCode: booking.bookingCode,
          },
          { status: 201 }
        );
      }

      case "expenses": {
        if (method === "GET") {
          const { searchParams } = new URL(req.url);
          const workshopId = searchParams.get("workshopId") || DEFAULT_WORKSHOP_ID;
          return NextResponse.json({ expenses: db.getExpenses(workshopId) });
        }
        if (method === "POST") {
          const body = await req.json();
          const validated = expenseSchema.parse(body);
          const workshopId = body.workshopId || DEFAULT_WORKSHOP_ID;
          const expense = db.createExpense(workshopId, {
            category: validated.category,
            title: validated.title,
            amount: validated.amount,
            expenseDate: validated.expenseDate,
            paymentMethod: validated.paymentMethod,
            notes: validated.notes,
          });
          await commitPersistence();
          return NextResponse.json({ expense }, { status: 201 });
        }
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
      }

      case "suppliers": {
        if (method === "GET") {
          const { searchParams } = new URL(req.url);
          const type = searchParams.get("type");
          const workshopId = searchParams.get("workshopId") || DEFAULT_WORKSHOP_ID;
          if (type === "purchases") {
            return NextResponse.json({ purchases: db.getPurchases(workshopId) });
          }
          return NextResponse.json({
            suppliers: db.getSuppliers(workshopId),
            purchases: db.getPurchases(workshopId),
          });
        }
        if (method === "POST") {
          const body = await req.json();
          const workshopId = body.workshopId || DEFAULT_WORKSHOP_ID;

          if (body.action === "receive") {
            const { purchaseId } = body;
            if (!purchaseId) return NextResponse.json({ error: "ID PO wajib disertakan" }, { status: 400 });
            const purchase = db.receivePurchaseGoods(workshopId, purchaseId);
            await commitPersistence();
            return NextResponse.json({ purchase });
          }

          if (body.action === "create_po") {
            const validated = purchaseOrderSchema.parse(body);
            const purchase = db.createPurchase(workshopId, validated.supplierId, validated.items, validated.notes);
            await commitPersistence();
            return NextResponse.json({ purchase }, { status: 201 });
          }

          const validated = supplierSchema.parse(body);
          const supplier = db.createSupplier(workshopId, {
            name: validated.name,
            contactPerson: validated.contactPerson,
            phone: validated.phone,
            email: validated.email || undefined,
            address: validated.address || undefined,
          });
          await commitPersistence();
          return NextResponse.json({ supplier }, { status: 201 });
        }
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
      }

      case "workshops": {
        if (method === "GET") {
          const { searchParams } = new URL(req.url);
          const slug = searchParams.get("slug");
          const id = searchParams.get("id");
          if (slug) {
            const workshop = db.getWorkshopBySlug(slug);
            if (!workshop) return NextResponse.json({ error: "Bengkel tidak ditemukan" }, { status: 404 });
            return NextResponse.json({ workshop });
          }
          if (id) {
            const workshop = db.getWorkshopById(id);
            if (!workshop) return NextResponse.json({ error: "Bengkel tidak ditemukan" }, { status: 404 });
            return NextResponse.json({ workshop });
          }
          return NextResponse.json({ workshops: db.getWorkshops() });
        }
        if (method === "PATCH") {
          const body = await req.json();
          const { id, name, phone, address, city, capacityPerDay, description } = body;
          if (!id) return NextResponse.json({ error: "Workshop ID is required" }, { status: 400 });
          const safeUpdates: Record<string, any> = {};
          if (name !== undefined) safeUpdates.name = String(name);
          if (phone !== undefined) safeUpdates.phone = String(phone);
          if (address !== undefined) safeUpdates.address = String(address);
          if (city !== undefined) safeUpdates.city = String(city);
          if (capacityPerDay !== undefined) safeUpdates.capacityPerDay = Number(capacityPerDay) || 10;
          if (description !== undefined) safeUpdates.description = String(description);
          const updated = db.updateWorkshop(id, safeUpdates);
          await commitPersistence();
          return NextResponse.json({ workshop: updated, message: "Pengaturan bengkel berhasil diperbarui" });
        }
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
      }

      case "subscriptions": {
        if (method === "GET") {
          const { searchParams } = new URL(req.url);
          const workshopId = searchParams.get("workshopId") || DEFAULT_WORKSHOP_ID;
          return NextResponse.json({ subscription: db.getSubscription(workshopId) });
        }
        if (method === "POST") {
          const { planCode, workshopId = DEFAULT_WORKSHOP_ID } = await req.json();
          if (!["free", "basic", "pro", "business"].includes(planCode)) {
            return NextResponse.json({ error: "Paket langganan tidak valid" }, { status: 400 });
          }
          const updated = db.upgradeSubscription(workshopId, planCode);
          await commitPersistence();
          return NextResponse.json({
            success: true,
            message: `Langganan berhasil diubah ke paket ${planCode.toUpperCase()}`,
            subscription: updated,
          });
        }
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
      }

      case "super-admin": {
        if (method === "GET") {
          return NextResponse.json({
            metrics: db.getPlatformMetrics(),
            workshops: db.getWorkshops(),
          });
        }
        if (method === "PATCH") {
          const { workshopId, status } = await req.json();
          if (!workshopId || !status) {
            return NextResponse.json({ error: "Workshop ID dan status wajib disertakan" }, { status: 400 });
          }
          const updated = db.updateWorkshopStatus(workshopId, status);
          await commitPersistence();
          return NextResponse.json({
            success: true,
            message: `Status bengkel berhasil diperbarui menjadi ${status}`,
            workshop: updated,
          });
        }
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
      }

      case "auth/register-workshop": {
        if (method !== "POST") {
          return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
        }
        const body = await req.json();
        const validated = registerWorkshopSchema.parse(body);
        const slug = validated.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        const existing = db.getWorkshopBySlug(slug);
        const finalSlug = existing ? `${slug}-${Math.floor(1000 + Math.random() * 9000)}` : slug;
        const ownerId = crypto.randomUUID();
        const workshop = db.createWorkshop({
          name: validated.name,
          slug: finalSlug,
          ownerId,
          phone: validated.phone,
          email: validated.email,
          workshopType: validated.workshopType,
          address: validated.address,
          city: validated.city,
          province: validated.province,
          description: validated.description || "",
          status: "approved",
          subscriptionTier: "free",
          capacityPerDay: 15,
          isPublicListed: true,
        });
        await commitPersistence();
        return NextResponse.json(
          { success: true, message: "Bengkel berhasil didaftarkan.", workshop },
          { status: 201 }
        );
      }

      case "ai": {
        if (method !== "POST") {
          return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
        }
        const { prompt, featureType = "diagnose", vehicleInfo } = await req.json();
        if (!prompt) {
          return NextResponse.json({ error: "Prompt pertanyaan wajib diisi." }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          const offlineAnswers: Record<string, string> = {
            gredek:
              "Gejala getar / 'gredek' pada rpm rendah pada motor matic umumnya disebabkan oleh kotoran atau debu kampas ganda yang menumpuk di mangkok kopling CVT, atau keausan seal kruk as yang memicu rembesan oli. Rekomendasi tindakan mekanik: Lakukan servis CVT, bersihkan mangkok ganda, periksa ketebalan kampas ganda, dan cek kondisi roller.",
            rem:
              "Gejala bunyi berdecit saat pengereman biasanya menandakan kampas rem sudah menipis hingga mendekati indikator besi pembatas, atau terdapat kotoran pasir/debu di piringan cakram (disc brake). Rekomendasi tindakan mekanik: Periksa ketebalan sisa kampas rem secara langsung dengan sigmat/jangka sorong dan bersihkan kaliper.",
            mogok:
              "Kendaraan mogok mendadak memerlukan pemeriksaan bertahap pada 3 unsur utama mesin pembakaran: 1) Pengapian (busi, koil, CDI/ECU), 2) Pasokan bahan bakar (pompa bensin, injector/karburator, filter bensin), 3) Kompresi silinder. Rekomendasi: Lakukan pengecekan fisik langsung oleh mekanik.",
          };

          const lowerPrompt = prompt.toLowerCase();
          let matchedAdvice = "";
          for (const key of Object.keys(offlineAnswers)) {
            if (lowerPrompt.includes(key)) {
              matchedAdvice = offlineAnswers[key];
              break;
            }
          }

          return NextResponse.json({
            response: matchedAdvice
              ? `[Mode Pengetahuan Standar BengkelPro]\n\n${matchedAdvice}\n\n*Catatan Keamanan: Diagnosa ini merupakan analisis awal berbasis gejala umum. Rekomendasikan pelanggan agar kendaraan dicek langsung di pit servis oleh mekanik bengkel.*`
              : `[Mode Pengetahuan Standar BengkelPro]\n\nUntuk keluhan "${prompt}": Disarankan mekanik memeriksa komponen penggerak, sistem pengapian, dan oli pelumas secara berurutan.\n\n*Catatan: Konfigurasikan GEMINI_API_KEY di file .env.local untuk mengaktifkan AI Generatif dinamis Google Gemini.*`,
            isLiveAI: false,
            apiKeyConfigured: false,
            message: "GEMINI_API_KEY belum dikonfigurasi di environment. Menggunakan basis pengetahuan internal otomotif.",
          });
        }

        const systemPrompt = `Anda adalah Asisten Ahli Otomotif BengkelPro Indonesia.
Tugas Anda: Membantu mekanik dan pemilik bengkel menganalisis keluhan kendaraan, memberikan checklist inspeksi, dan saran teknis.
Aturan Wajib:
1. Berkomunikasi selalu dalam Bahasa Indonesia yang profesional dan mudah dipahami.
2. Bedakan antara kemungkinan umum dan temuan mekanik yang terbukti.
3. Selalu sarankan pemeriksaan fisik langsung oleh mekanik bersertifikat.
4. Jangan pernah menyatakan kepastian 100% tanpa inspeksi visual/alat ukur mekanik.
5. Jangan pernah mengubah status pembayaran, stok suku cadang, atau persetujuan SPK.`;

        const fullPrompt = `${systemPrompt}\n\nFitur: ${featureType}\nInformasi Kendaraan: ${vehicleInfo || "Umum"}\nPertanyaan/Keluhan: ${prompt}`;
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const res = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
          }),
        });

        const data = await res.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!reply) throw new Error("Gagal memperoleh respons dari Gemini API");

        return NextResponse.json({
          response: reply,
          isLiveAI: true,
          apiKeyConfigured: true,
        });
      }

      default:
        return NextResponse.json({ error: `Endpoint /api/${route} tidak ditemukan` }, { status: 404 });
    }
  } catch (err: any) {
    return zodOrMessage(err, `Gagal memproses /api/${route}`);
  }
}
