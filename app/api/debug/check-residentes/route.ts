import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    // Ver estructura de la tabla residentes
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'residentes'
      ORDER BY ordinal_position
    `;

    // Ver datos de muestra
    const sample = await sql`SELECT * FROM residentes LIMIT 3`;

    return NextResponse.json({
      columns,
      sample
    });

  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
