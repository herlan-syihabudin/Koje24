import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  const html = `
    <!DOCTYPE html>
    <html>
      <body>
        <h1 style="font-family: sans-serif;">Invoice ${id}</h1>
        <p>HTML invoice OK</p>
      </body>
    </html>
  `;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}
