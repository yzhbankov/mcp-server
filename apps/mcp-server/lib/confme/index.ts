import * as fs from 'fs';

function replace(template: any, vars: any) {
    return template.replace(/\{\{(.+?)\}\}/g, (match: any, p1: any) => {
        // eslint-disable-next-line no-prototype-builtins
        if (vars.hasOwnProperty(p1)) {
            return vars[p1];
        }
        throw new Error(`Variable "${p1}" not set!`);
    });
}

export type ConfigType = {
    serverPort: number;
};

export default function confme(configPath: string): ConfigType {
    const template = fs.readFileSync(configPath).toString();
    const configStr = replace(template, process.env);

    let config = {};

    try {
        config = JSON.parse(configStr);
    } catch (error) {
        console.error('CANNOT PARSE JSON:', configStr);
        throw error;
    }

    return config as ConfigType;
}
