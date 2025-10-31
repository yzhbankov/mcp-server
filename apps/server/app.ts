import * as RestApi from './lib/restApi/index.js';
import {config} from './lib/config.js';

export async function main(): Promise<void> {
    RestApi.startServer({
        serverPort: config.serverPort,
    });

    // Add Global Unhandled Errors Handlers
    async function exit() {
        await RestApi.stopServer();
        console.log('Exit');
        process.exit(0);
    }

    process.on('SIGTERM', async () => {
        console.error('SIGTERM signal caught');
        await exit();
    });

    process.on('SIGINT', async () => {
        console.error('SIGINT signal caught');
        await exit();
    });

    process.on('unhandledRejection', (error: Error) => {
        console.error('unhandledRejection', error.stack);
    });

    process.on('uncaughtException', (error: Error) => {
        console.error('uncaughtException', error.stack);
    });
}

main().catch((err) => {
    console.error(err);

    process.exit(1);
});
