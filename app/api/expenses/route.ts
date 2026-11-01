import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { expenseSchema } from "@/schemas";

const defaultWorkshopId = "11111111-1111-4111-8111-111111111111";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const workshopId = searchParams.get("workshopId") || defaultWorkshopId;

  const expenses = db.getExpenses(workshopId);
  return NextResponse.json({ expenses });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = expenseSchema.parse(body);
    const workshopId = body.workshopId || defaultWorkshopId;

    const expense = db.createExpense(workshopId, {
      category: validated.category,
      title: validated.title,
      amount: validated.amount,
      expenseDate: validated.expenseDate,
      paymentMethod: validated.paymentMethod,
      notes: validated.notes,
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json({ error: err.errors[0]?.message || "Validasi gagal" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Gagal mencatat pengeluaran" }, { status: 400 });
  }
}
