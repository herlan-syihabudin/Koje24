// app/api/dashboard/settings/route.ts

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";
import { defaultSettings, Settings } from "@/lib/settings";

const SETTINGS_SHEET = "Settings";
const RANGE = `${SETTINGS_SHEET}!A2:B`;

// Helper: Load settings from Google Sheets
async function loadSettings(): Promise<Settings> {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = res.data.values || [];
    const settings = { ...defaultSettings };

    rows.forEach((row) => {
      const key = row[0];
      const value = row[1];
      if (!key) return;

      // Parse nested objects
      if (key.startsWith("contact.")) {
        const field = key.split(".")[1];
        (settings.contact as any)[field] = value;
      } else if (key.startsWith("social.")) {
        const field = key.split(".")[1];
        (settings.social as any)[field] = value;
      } else if (key.startsWith("seo.")) {
        const field = key.split(".")[1];
        (settings.seo as any)[field] = value;
      } else if (key.startsWith("promoGlobal.")) {
        const field = key.split(".")[1];
        (settings.promoGlobal as any)[field] = 
          field === "active" ? value === "true" : Number(value);
      } else {
        (settings as any)[key] = 
          key === "maintenanceMode" ? value === "true" : Number(value) || value;
      }
    });

    return settings;
  } catch (error) {
    console.error("❌ Error loading settings:", error);
    return defaultSettings;
  }
}

// Helper: Save settings to Google Sheets
async function saveSettings(settings: Settings) {
  const flatSettings: [string, string][] = [];

  // Flatten settings object
  flatSettings.push(["shippingCost", String(settings.shippingCost)]);
  flatSettings.push(["minOrder", String(settings.minOrder)]);
  flatSettings.push(["maintenanceMode", String(settings.maintenanceMode)]);
  flatSettings.push(["contact.whatsapp", settings.contact.whatsapp]);
  flatSettings.push(["contact.email", settings.contact.email]);
  flatSettings.push(["contact.address", settings.contact.address]);
  flatSettings.push(["social.instagram", settings.social.instagram]);
  flatSettings.push(["social.facebook", settings.social.facebook]);
  flatSettings.push(["social.twitter", settings.social.twitter]);
  flatSettings.push(["seo.title", settings.seo.title]);
  flatSettings.push(["seo.description", settings.seo.description]);
  flatSettings.push(["promoGlobal.active", String(settings.promoGlobal.active)]);
  flatSettings.push(["promoGlobal.discountPercent", String(settings.promoGlobal.discountPercent)]);
  flatSettings.push(["promoGlobal.minSpend", String(settings.promoGlobal.minSpend)]);

  // Clear existing data and write new
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: RANGE,
    valueInputOption: "RAW",
    requestBody: {
      values: flatSettings,
    },
  });
}

// GET: Load settings
export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdminFromRequest(req);
    if (!guard.ok) return guard.res;

    const settings = await loadSettings();
    
    console.log(`✅ Settings loaded by: ${guard.admin?.email || "unknown"}`);
    
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("❌ GET settings error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Gagal load settings" 
      },
      { status: 500 }
    );
  }
}

// POST: Save settings
export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdminFromRequest(req);
    if (!guard.ok) return guard.res;

    const body = await req.json();

    // 🔥 Validasi body
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    await saveSettings(body);
    
    console.log(`✅ Settings saved by: ${guard.admin?.email || "unknown"}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ POST settings error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Gagal save settings" 
      },
      { status: 500 }
    );
  }
}
