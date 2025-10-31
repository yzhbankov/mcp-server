import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.defaults') });
dotenv.config({ path: path.join(__dirname, '../.env') });

type ConfigType = {
    serverUrl: string;
    openAIApiKey: string;
};

export const config: ConfigType = {
    serverUrl: process.env.MCP_SERVER_URL || 'http://localhost:3000',
    openAIApiKey: process.env.OPENAI_API_KEY || '',
};
