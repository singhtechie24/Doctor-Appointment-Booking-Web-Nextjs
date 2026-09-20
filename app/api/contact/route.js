import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(req) {
  try {
    const { name, email, phone, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Connect to PostgreSQL (Supabase) to store inquiry
    const client = new Client({
      host: process.env.DATABASE_HOST || 'aws-1-eu-west-1.pooler.supabase.com',
      port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 5432,
      user: process.env.DATABASE_USERNAME || 'postgres.hxdfkziscsphbrsidmmr',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'postgres',
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    
    // Ensure table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS contact_inquiries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert record
    const result = await client.query(
      `INSERT INTO contact_inquiries (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING id, created_at;`,
      [name, email, phone || '', message]
    );

    await client.end();

    return NextResponse.json({ success: true, inquiryId: result.rows[0].id });
  } catch (error) {
    console.error('Contact API Internal Error:', error);
    // Return friendly, professional public error without exposing internal DB or system details
    return NextResponse.json(
      { error: 'Unable to send your inquiry at this moment. Please try again shortly or call our clinic directly.' },
      { status: 500 }
    );
  }
}
