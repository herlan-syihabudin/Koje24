export async function GET() {
  try {
    const url = process.env.SHEET_URL!;
    
    // === PERBAIKAN: MENAMBAHKAN { cache: 'no-store' } ===
    const res = await fetch(url, { cache: 'no-store' }); 
    // ====================================================
    
    if (!res.ok) {
        throw new Error(`Apps Script responded with status: ${res.status}`);
    }
    
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error("Error GET testimonial:", err);
    return new Response("Failed to fetch", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = process.env.SHEET_URL!;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error("Error POST testimonial:", err);
    return new Response("Failed to post", { status: 500 });
  }
}
