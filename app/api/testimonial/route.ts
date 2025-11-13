export async function GET() {
  try {
    const url = "https://script.google.com/macros/s/AKfycbz-hfzgNZS8EHX5JOjFz2dxIuxTqF6oyRygCoo79ge4NlSofvtT7XGrflw4a8Stxld1Ww/exec"
    const res = await fetch(url, { cache: "no-store" })

    if (!res.ok) {
      throw new Error(`Apps Script responded with status: ${res.status}`)
    }

    const text = await res.text()
    console.log("Response dari Google Script:", text)

    let data: any[] = []
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.error("Gagal parse JSON:", e)
      data = []
    }

    const safeData = (Array.isArray(data) ? data : []).map((r: any) => ({
      nama: r?.nama?.toString?.() ?? "",
      kota: r?.kota?.toString?.() ?? "",
      pesan: r?.pesan?.toString?.() ?? "",
      rating: Number(r?.rating ?? 0),
      varian: r?.varian?.toString?.() ?? "",
      ShowOnHome: r?.ShowOnHome?.toString?.() ?? "FALSE",
      img: r?.img?.toString?.() ?? "",
    }))

    return Response.json(safeData)
  } catch (err) {
    console.error("Error GET testimonial:", err)
    return new Response("Failed to fetch", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const url = "https://script.google.com/macros/s/AKfycbz-hfzgNZS8EHX5JOjFz2dxIuxTqF6oyRygCoo79ge4NlSofvtT7XGrflw4a8Stxld1Ww/exec"

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const text = await res.text()
    console.log("Response POST dari Google Script:", text)

    let data: any = {}
    try {
      data = JSON.parse(text)
    } catch {
      data = { success: text.includes("success") }
    }

    return Response.json(data)
  } catch (err) {
    console.error("Error POST testimonial:", err)
    return new Response("Failed to post", { status: 500 })
  }
}
