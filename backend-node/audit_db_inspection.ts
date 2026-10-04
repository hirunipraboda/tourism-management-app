import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function runAudit() {
  console.log('====================================================');
  console.log('DATABASE INSPECTION AUDIT');
  console.log('====================================================');

  try {
    // 1. Connection check
    await prisma.$queryRaw`SELECT 1`;
    console.log('DATABASE CONNECTION:\n✓ Connected successfully\n');
  } catch (err: any) {
    console.error('DATABASE CONNECTION:\n✗ Connection failed\n', err.message);
    process.exit(1);
  }

  // 2. Database & Version info
  const dbInfo: any[] = await prisma.$queryRaw`
    SELECT current_database() as db_name, current_user as db_user, version() as db_version
  `;
  console.log('Connection Info:');
  console.log('  Database:', dbInfo[0]?.db_name);
  console.log('  User:', dbInfo[0]?.db_user);
  console.log('  PostgreSQL Version:', dbInfo[0]?.db_version.split(',')[0]);
  console.log('  Database URL (masked):', process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':****@'));
  console.log();

  // 3. Tables in public schema
  const tables: any[] = await prisma.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;

  console.log(`Found ${tables.length} tables in public schema:`);
  for (const t of tables) {
    const countRes: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM "public"."${t.table_name}"`);
    console.log(`  - ${t.table_name} (rows: ${countRes[0]?.count})`);
  }
  console.log();

  // 4. Primary Keys
  const pks: any[] = await prisma.$queryRaw`
    SELECT tc.table_name, kcu.column_name, tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public'
    ORDER BY tc.table_name;
  `;
  console.log('Primary Keys:');
  for (const pk of pks) {
    console.log(`  ${pk.table_name} -> ${pk.column_name} (${pk.constraint_name})`);
  }
  console.log();

  // 5. Foreign Keys
  const fks: any[] = await prisma.$queryRaw`
    SELECT 
      tc.table_name AS source_table, 
      kcu.column_name AS source_column, 
      ccu.table_name AS target_table, 
      ccu.column_name AS target_column,
      rc.delete_rule,
      rc.update_rule,
      tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu 
      ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints rc
      ON rc.constraint_name = tc.constraint_name AND rc.constraint_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.column_name;
  `;
  console.log(`Found ${fks.length} Foreign Keys:`);
  for (const fk of fks) {
    console.log(`  ${fk.source_table}.${fk.source_column} -> ${fk.target_table}.${fk.target_column} [ON DELETE ${fk.delete_rule}]`);
  }
  console.log();

  // 6. Detailed columns per table
  console.log('Table Column Details:');
  for (const t of tables) {
    const cols: any[] = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${t.table_name}
      ORDER BY ordinal_position;
    `;
    console.log(`--- Table: ${t.table_name} (${cols.length} columns) ---`);
    for (const c of cols) {
      console.log(`    ${c.column_name.padEnd(24)} ${c.data_type.padEnd(18)} Nullable: ${c.is_nullable.padEnd(4)} Default: ${c.column_default || 'none'}`);
    }
  }

  await prisma.$disconnect();
}

runAudit().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
