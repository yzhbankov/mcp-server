import {processQuery} from './lib/models/queryProcessor.js';

async function main() {
    console.log('🧩 MCP + OpenAI Client Ready! Type your query (or "exit").');
    process.stdin.setEncoding('utf8');

    const ask = () => {
        process.stdout.write('\nYou: ');
        process.stdin.once('data', async (input: string) => {
            const query = input.trim();
            if (query.toLowerCase() === 'exit') process.exit(0);
            try {
                const response = await processQuery(query);
                console.log('\n🤖 LLM:', response);
            } catch (err: any) {
                console.error('❌ Error:', err.message);
            }
            ask();
        });
    };
    ask();
}

main();
