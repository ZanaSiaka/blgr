import { NextResponse } from "next/server";

import { API_BASE } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const siteId = url.searchParams.get("site_id");
  const date = url.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const format = url.searchParams.get("format") === "pdf" ? "pdf" : "xlsx";

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const response = await fetch(
    `${API_BASE}/api/v1/daily-journals/${siteId}/${date}/export?format=${format}`,
    {
      headers: { Authorization: `Bearer ${session.token}` },
      cache: "no-store",
    },
  );
  if (!response.ok) {
    return NextResponse.json({ error: `Export impossible (${response.status})` }, { status: response.status });
  }

  const body = await response.arrayBuffer();
  const contentType =
    format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="journal-${siteId}-${date}.${format}"`,
    },
  });
}