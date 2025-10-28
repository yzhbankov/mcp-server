import * as path from 'path';
import * as dotenv from 'dotenv';
import confme, {ConfigType} from './confme';

function getEnvPath(env?: string): string | null {
    if (env === 'test') {
        return path.join(__dirname, '../.env.test');
    }
    return path.join(__dirname, '../.env');
}

const envPath = getEnvPath(process.env.NODE_ENV);

if (envPath) {
    dotenv.config({path: envPath});
}

const ROOT_SERVER_PATH = __dirname;

const config: ConfigType = confme(path.join(ROOT_SERVER_PATH, '../config/config.json'));

export {config};
