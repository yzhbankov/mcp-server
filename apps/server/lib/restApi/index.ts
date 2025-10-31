import express, {Express} from 'express';
import middlewares from './middlewares.js';
import v1Router from './v1/router.js';

let server: null | ReturnType<Express['listen']> = null;
export const app = express();

app.use(middlewares.json);

app.use('/', v1Router);

export function startServer({serverPort}: { serverPort: number }): void {
    server = app.listen(serverPort, () => {
        console.log('Server listening on port:', serverPort);
    });
}

export async function stopServer(): Promise<void> {
    if (!server) return;

    server.close();
    console.log('Server stopped');
}
