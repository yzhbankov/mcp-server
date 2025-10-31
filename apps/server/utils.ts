import { promises as fs } from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

export interface MySQLConfig {
    host: string;
    user: string;
    password: string;
    database: string;
    port?: number;
}

export async function queryMySQL(config: MySQLConfig, sql: string, params: any[] = []): Promise<any[]> {
    const connection = await mysql.createConnection(config);
    try {
        const [rows] = await connection.execute<any[]>(sql, params);
        return rows;
    } finally {
        await connection.end();
    }
}

export async function readFilesRecursively(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
        entries.map(async (entry) => {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                return readFilesRecursively(fullPath);
            } else {
                return fullPath;
            }
        })
    );
    return files.flat();
}
