import { google } from "googleapis"

// Force OpenSSL Legacy Provider (fix ERR_OSSL_UNSUPPORTED)
process.env.NODE_OPTIONS = "--openssl-legacy-provider"

const GOOGLE_SERVICE_KEY = process.env.GOOGLE_SERVICE_KEY
const SHEET_ID = process.env.SHEET_ID

if (!GOOGLE_SERVICE_KEY || !SHEET_ID) {
  throw new Error("Missing environment variables SHEET_ID or GOOGLE_SERVICE_KEY")
}

const credentials =
  typeof GOOGLE_SERVICE_KEY === "string"
    ? JSON.parse(GOOGLE_SERVICE_KEY)
    : GOOGLE_SERVICE_KEY

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
})

async function appendToSheet(values: any[]) {
  const client = await auth.getClient()
  const sheets = google.sheets({ version: "v4", auth: client })

  return await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Orders!A1",
    valueInputOption: "RAW",
    requestBody: {
      values: [values],
    },
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const orderData = [
      new Date().toLocaleString("id-ID"),
      body.name,
      body.address,
      body.phone,
      JSON.stringify(body.items),
      body.total,
    ]

    await appendToSheet(orderData)

    return Response.json({ success: true })
  } catch (err: any) {
    console.error("API /order ERROR:", err)
    return Response.json({ success: false, error: err.message })
  }
}
