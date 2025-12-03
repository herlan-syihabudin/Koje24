import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params; // ⛔ JANGAN pakai await

  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <body>
          <h1 style="font-family: sans-serif;">Invoice ${id}</h1>
          <p>HTML invoice OK</p>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Invoice HTML error", detail: err?.message ?? err },
      { status: 500 }
    );
  }
}
