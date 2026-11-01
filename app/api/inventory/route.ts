import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productSchema, stockAdjustmentSchema } from "@/schemas";

const defaultWorkshopId = "11111111-1111-4111-8111-111111111111";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const includeMovements = searchParams.get("includeMovements") === "true";
  const productId = searchParams.get("productId") || undefined;
  const workshopId = searchParams.get("workshopId") || defaultWorkshopId;

  const products = db.getProducts(workshopId, search);

  let movements: any[] = [];
  if (includeMovements) {
    movements = db.getStockMovements(workshopId, productId);
  }

  return NextResponse.json({ products, movements });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const workshopId = body.workshopId || defaultWorkshopId;

    if (body.action === "adjust") {
      const validated = stockAdjustmentSchema.parse(body);
      const updatedProduct = db.adjustStock(
        workshopId,
        validated.productId,
        validated.movementType,
        validated.quantity,
        validated.notes
      );
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

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json({ error: err.errors[0]?.message || "Validasi gagal" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Gagal memproses produk" }, { status: 400 });
  }
}
