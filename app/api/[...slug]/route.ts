import { dispatchApiRequest } from "@/lib/api/router";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string[] }> | { slug: string[] };
};

async function handle(req: Request, context: RouteContext) {
  const resolved = await Promise.resolve(context.params);
  return dispatchApiRequest(req, resolved.slug || []);
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
