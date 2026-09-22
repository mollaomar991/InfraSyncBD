import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();
async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'infrasync_bd'
  });
  const [rows] = await connection.query('SELECT email, password_hash, role_id FROM users');
  console.log(rows);
  connection.end();
}
run().catch(console.error);
