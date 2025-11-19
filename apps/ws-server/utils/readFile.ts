import {promises as fs} from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Reads a Markdown (.md) file and returns its content as a string.
 * @param filePath Path to the Markdown file.
 */
async function readMarkdownFile(filePath: string): Promise<string> {
    try {
        const absolutePath = path.resolve(filePath);
        const content = await fs.readFile(absolutePath, 'utf8');
        return content;
    } catch (error) {
        throw new Error(`Failed to read markdown file: ${(error as Error).message}`);
    }
}


export async function readLoginDocs(): Promise<string> {
    return readMarkdownFile(path.join(__dirname, './login.md'));
}

export async function readGroupsDocs(): Promise<string> {
    return readMarkdownFile(path.join(__dirname, './groupCreate.md'));
}

