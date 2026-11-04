import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workOrderSchema } from "@/schemas";

const defaultWorkshopId = "11111111-1111-4111-8111-111111111111";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const status = (searchParams.get("status") as any) || undefined;
  const workshopId = searchParams.get("workshopId") || defaultWorkshopId;

  if (id) {
    const wo = db.getWorkOrderById(workshopId, id);
    if (!wo) return NextResponse.json({ error: "Work order tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ workOrder: wo });
  }

  const workOrders = db.getWorkOrders(workshopId, status);
  return NextResponse.json({ workOrders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = workOrderSchema.parse(body);
    const workshopId = body.workshopId || defaultWorkshopId;

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

    return NextResponse.json({ workOrder: newWO }, { status: 201 });
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json({ error: err.errors[0]?.message || "Validasi gagal" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Gagal membuat SPK" }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      status,
      notes,
      workshopId = defaultWorkshopId,
      customerApprovalStatus,
      inspectionFindings,
      addItem,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID SPK wajib disertakan" }, { status: 400 });
    }

    const wo = db.getWorkOrderById(workshopId, id);
    if (!wo) {
      return NextResponse.json({ error: "Work order tidak ditemukan" }, { status: 404 });
    }

    if (customerApprovalStatus) {
      wo.customerApprovalStatus = customerApprovalStatus;
      if (customerApprovalStatus === "approved") {
        wo.approvedAt = new Date().toISOString();
      }
    }

    if (inspectionFindings !== undefined) {
      wo.inspectionFindings = inspectionFindings;
      wo.updatedAt = new Date().toISOString();
    }

    if (addItem) {
      db.addWorkOrderItem(workshopId, id, addItem);
    }

    if (status) {
      db.updateWorkOrderStatus(workshopId, id, status, notes);
    }

    const updated = db.getWorkOrderById(workshopId, id);
    return NextResponse.json({ workOrder: updated || wo });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memperbarui SPK" }, { status: 400 });
  }
}
