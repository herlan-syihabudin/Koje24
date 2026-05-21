export async function GET() {
  try {
    const url =
      "https://script.google.com/macros/s/AKfycbz-hfzgNZS8EHX5JOjFz2dxIuxTqF6oyRygCoo79ge4NlSofvtT7XGrflw4a8Stxld1Ww/exec?t=" +
      Date.now()

    const res = await fetch(url, { cache: "no-store" })
    const text = await res.text()
    const data = JSON.parse(text)

    // 🔥 PARSING DATA DARI APPS SCRIPT
    const allData = (Array.isArray(data) ? data : []).map((r: any) => ({
      timestamp: r?.timestamp?.toString?.() ?? "",
      nama: r?.nama?.toString?.() ?? "",
      kota: r?.kota?.toString?.() ?? "",
      varian: r?.varian?.toString?.() ?? "",
      pesan: r?.pesan?.toString?.() ?? "",
      rating: Number(r?.rating ?? 0),
      img: r?.img?.toString?.() ?? "",
      showOnHome: (r?.showOnHome ?? r?.ShowOnHome ?? "false")
        .toString()
        .trim()
        .toLowerCase(),
      active: (r?.active ?? r?.Active ?? "false")
        .toString()
        .trim()
        .toLowerCase(),
    }))

    // 🔥🔥 FILTER: HANYA YANG AKTIF (true) 🔥🔥
    const activeTestimonials = allData.filter(
      (t) => t.active === "true" || t.active === "yes" || t.active === "1"
    )

    return Response.json(activeTestimonials)
  } catch (err) {
    console.error("Error GET testimonial:", err)
    return new Response("Failed to fetch", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const url =
      "https://script.google.com/macros/s/AKfycbz-hfzgNZS8EHX5JOjFz2dxIuxTqF6oyRygCoo79ge4NlSofvtT7XGrflw4a8Stxld1Ww/exec"

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    return Response.json(data)
  } catch (err) {
    console.error("Error POST testimonial:", err)
    return new Response("Failed to post", { status: 500 })
  }
}
