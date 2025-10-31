import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.defaults') });
dotenv.config({ path: path.join(__dirname, '../.env') });

type ConfigType = {
    serverPort: number;
};

export const config: ConfigType = {
    serverPort: process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : 3000,
};
