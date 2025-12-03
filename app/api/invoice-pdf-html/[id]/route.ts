import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // ⛔ jangan await
    const { id } = context.params;

    const html = `
      <html>
        <body>
          <h1>Invoice ${id}</h1>
          <p>PDF HTML engine OK</p>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (err: any) {
    console.error("invoice-html error:", err);
    return NextResponse.json(
      { error: "Failed generate HTML", detail: err?.message ?? err },
      { status: 500 }
    );
  }
}
