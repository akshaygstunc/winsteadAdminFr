import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const xlsx = path.join(
    process.cwd(),
    "public",
    "property_import_template.xlsx"
  );

  const csv = path.join(
    process.cwd(),
    "public",
    "property_import_template.csv"
  );

  return NextResponse.json({
    xlsxExists: fs.existsSync(xlsx),
    csvExists: fs.existsSync(csv),
    cwd: process.cwd(),
  });
}