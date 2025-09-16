// Neon PostgreSQL connection for Next.js API routes
import { neon } from '@neondatabase/serverless';

// Usa tu URL de conexión de Neon (PostgreSQL en la nube)
// Ejemplo: postgres://user:password@ep-xxxxxx.us-east-2.aws.neon.tech/db

export const sql = neon(process.env.DATABASE_URL!);

// Helper para hacer queries fácilmente con tagged template
// Uso: await query`SELECT * FROM table WHERE id = ${id}`
export const query = sql;
