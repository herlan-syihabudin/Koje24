import { google } from "googleapis";

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets.readonly"]
);

export const sheets = google.sheets({
  version: "v4",
  auth,
});

export const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
