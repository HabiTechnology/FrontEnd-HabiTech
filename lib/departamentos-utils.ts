import { sql } from '@/lib/db'

// Función para actualizar estado de departamento basado en asignaciones
export async function actualizarEstadoDepartamento(departamentoId: number) {
  try {
    // Verificar si hay un residente asignado
    const residenteAsignado = await sql`
      SELECT r.id, r.nombre 
      FROM residentes r
      WHERE r.departamento_id = ${departamentoId} 
      AND r.activo = true
      LIMIT 1
    `

    // Determinar el nuevo estado
    let nuevoEstado = 'disponible'
    if (residenteAsignado.length > 0) {
      nuevoEstado = 'ocupado'
    }

    // Actualizar el estado del departamento
    await sql`
      UPDATE departamentos 
      SET estado = ${nuevoEstado}
      WHERE id = ${departamentoId}
    `

    
    return {
      departamentoId,
      nuevoEstado,
      residenteAsignado: residenteAsignado[0] || null
    }

  } catch (error) {

    throw error
  }
}

// Función para asignar residente a departamento
export async function asignarResidenteADepartamento(
  residenteId: number, 
  departamentoId: number
) {
  try {
    // 1. Verificar que el departamento esté disponible
    const departamento = await sql`
      SELECT id, numero, estado 
      FROM departamentos 
      WHERE id = ${departamentoId} AND activo = true
    `

    if (departamento.length === 0) {
      throw new Error('Departamento no encontrado')
    }

    if (departamento[0].estado === 'ocupado') {
      throw new Error('El departamento ya está ocupado')
    }

    // 2. Liberar departamento anterior del residente (si tenía uno)
    await sql`
      UPDATE departamentos 
      SET estado = 'disponible'
      WHERE id IN (
        SELECT departamento_id 
        FROM residentes 
        WHERE id = ${residenteId} AND departamento_id IS NOT NULL
      )
    `

    // 3. Asignar nuevo departamento al residente
    await sql`
      UPDATE residentes 
      SET departamento_id = ${departamentoId}
      WHERE id = ${residenteId}
    `

    // 4. Actualizar estado del departamento a ocupado
    await sql`
      UPDATE departamentos 
      SET estado = 'ocupado'
      WHERE id = ${departamentoId}
    `

    
    return {
      residenteId,
      departamentoId,
      mensaje: 'Asignación exitosa'
    }

  } catch (error) {

    throw error
  }
}

// Función para liberar departamento
export async function liberarDepartamento(departamentoId: number) {
  try {
    // 1. Remover asignación de residentes
    await sql`
      UPDATE residentes 
      SET departamento_id = NULL
      WHERE departamento_id = ${departamentoId}
    `

    // 2. Cambiar estado a disponible
    await sql`
      UPDATE departamentos 
      SET estado = 'disponible'
      WHERE id = ${departamentoId}
    `

    
    return {
      departamentoId,
      estado: 'disponible',
      mensaje: 'Departamento liberado exitosamente'
    }

  } catch (error) {

    throw error
  }
}

// Función para obtener información completa del departamento con residente
export async function obtenerDepartamentoConResidente(departamentoId: number) {
  try {
    const resultado = await sql`
      SELECT 
        d.*,
        r.id as residente_id,
        r.nombre as residente_nombre,
        r.correo as residente_correo,
        r.telefono as residente_telefono,
        r.documento as residente_documento
      FROM departamentos d
      LEFT JOIN residentes r ON d.id = r.departamento_id AND r.activo = true
      WHERE d.id = ${departamentoId}
    `

    if (resultado.length === 0) {
      throw new Error('Departamento no encontrado')
    }

    const departamento = resultado[0]
    
    return {
      ...departamento,
      residente: departamento.residente_id ? {
        id: departamento.residente_id,
        nombre: departamento.residente_nombre,
        correo: departamento.residente_correo,
        telefono: departamento.residente_telefono,
        documento: departamento.residente_documento
      } : null
    }

  } catch (error) {

    throw error
  }
}

// Función para sincronizar todos los estados de departamentos
export async function sincronizarEstadosDepartamentos() {
  try {

    
    // Obtener todos los departamentos activos
    const departamentos = await sql`
      SELECT id FROM departamentos WHERE activo = true
    `

    // Actualizar estado de cada uno
    for (const dept of departamentos) {
      await actualizarEstadoDepartamento(dept.id)
    }

    
    return {
      departamentosSincronizados: departamentos.length,
      mensaje: 'Sincronización completada'
    }

  } catch (error) {

    throw error
  }
}
