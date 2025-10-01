import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log("👷 Fetching building staff...")

    const result = await sql`
      SELECT 
        id,
        nombre,
        apellido,
        cargo,
        telefono,
        correo,
        documento_identidad,
        fecha_contratacion,
        salario,
        activo
      FROM personal_edificio
      ORDER BY activo DESC, fecha_contratacion DESC
    `

    console.log("👷 Building staff result:", result)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error("❌ Error in personal-edificio API:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Error al obtener personal del edificio",
        data: []
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, apellido, cargo, telefono, correo, documento_identidad, salario } = body

    console.log("👷 Creating new staff member:", body)

    const result = await sql`
      INSERT INTO personal_edificio 
        (nombre, apellido, cargo, telefono, correo, documento_identidad, fecha_contratacion, salario, activo)
      VALUES 
        (${nombre}, ${apellido}, ${cargo}::cargo_personal, ${telefono}, ${correo}, ${documento_identidad}, CURRENT_DATE, ${salario || 0}, true)
      RETURNING *
    `

    console.log("✅ Staff member created:", result)

    return NextResponse.json({
      success: true,
      data: result[0],
      message: "Personal agregado exitosamente"
    })

  } catch (error) {
    console.error("❌ Error creating staff member:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Error al crear personal del edificio"
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID requerido" },
        { status: 400 }
      )
    }

    console.log("👷 Deactivating staff member:", id)

    const result = await sql`
      UPDATE personal_edificio 
      SET activo = false
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      data: result[0],
      message: "Personal desactivado exitosamente"
    })

  } catch (error) {
    console.error("❌ Error deactivating staff member:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Error al desactivar personal"
      },
      { status: 500 }
    )
  }
}
