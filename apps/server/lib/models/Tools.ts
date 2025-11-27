import fs from 'fs';
import path from 'path';
import {VM} from 'vm2';
import {readdir, stat} from 'fs/promises';
import nodemailer from 'nodemailer';
import {exec} from 'child_process';
import {promisify} from 'util';
import {queryMySQL} from '../utils/index.js';
import {runSystemHealthCheck} from '../utils/healthCheck.js';
import {readLoginDocs, readGroupsDocs} from '../utils/readFile.js';

const execAsync = promisify(exec);

export const tools = new Map<string, ToolDefinition>();

type ToolDefinition = {
    name: string;
    description?: string;
    inputSchema?: any;
    outputSchema?: any;
    execute: (input: any) => Promise<any>;
};

function registerTool(name: string, meta: any, handler: any) {
    tools.set(name, { name, ...meta, execute: handler });
}

registerTool(
    'add',
    {
        title: 'Addition Tool',
        description: 'Add two numbers',
        inputSchema: {
            type: 'object',
            properties: {
                a: { type: 'number' },
                b: { type: 'number' }
            },
            required: ['a', 'b']
        },
        outputSchema: {
            type: 'object',
            properties: { result: { type: 'number' } },
            required: ['result']
        }
    },
    async ({ a, b }: { a: number; b: number }) => {
        const result = { result: a + b };
        return {
            content: [{ type: 'text', text: JSON.stringify(result) }]
        };
    }
);

registerTool(
    'db_users',
    {
        title: 'DB Users Tool',
        description: 'Database users query operation',
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'array', items: { type: 'object' } }
    },
    async () => {
        const result = await queryMySQL(
            { password: 'dr2_prod', user: 'dr2_prod', host: 'localhost', database: 'dr2_prod' },
            'SELECT uid, email, role, created_at, updated_at, last_sign_in_at FROM users'
        );

        return {
            content: [{ type: 'text', text: JSON.stringify(result) }],
        };
    }
);

registerTool(
    'sql_query',
    {
        title: 'SQL Query Tool',
        description: 'Execute SQL query',
        inputSchema: {
            type: 'object',
            properties: { query: { type: 'string' } },
            required: ['query']
        },
        outputSchema: { type: 'array', items: { type: 'object' } }
    },
    async ({ query }: { query: string }) => {
        const result = await queryMySQL(
            { password: 'dr2_prod', user: 'dr2_prod', host: 'localhost', database: 'dr2_prod' },
            query
        );
        return {
            content: [{ type: 'text', text: JSON.stringify(result) }],
        };
    }
);

registerTool(
    'dir_query',
    {
        title: 'Directory Query Tool',
        description: 'Return folder structure',
        inputSchema: {
            type: 'object',
            properties: { path: { type: 'string' } },
            required: ['path']
        },
        outputSchema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    type: { type: 'string', enum: ['directory', 'file'] }
                }
            }
        }
    },
    async ({ path: dirPath }: { path: string }) => {
        const entries = await readdir(dirPath);
        const result = [];

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry);
            const entryStat = await stat(fullPath);
            result.push({
                name: entry,
                type: entryStat.isDirectory() ? 'directory' : 'file'
            });
        }

        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

// registerTool(
//     'system_health_check',
//     {
//         title: 'System Health Check Tool',
//         description: 'Return system health status',
//         inputSchema: { type: 'object', properties: {} },
//         outputSchema: { type: 'object' }
//     },
//     async () => {
//         const result = runSystemHealthCheck();
//         return {
//             content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
//         };
//     }
// );

registerTool(
    'api_login_documentation',
    {
        title: 'API Login Documentation Tool',
        description: 'Return API login documentation',
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object' }
    },
    async () => {
        const result = await readLoginDocs();
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

registerTool(
    'api_groups_doc',
    {
        title: 'API Groups Documentation Tool',
        description: 'Return API Groups Documentation',
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object' }
    },
    async () => {
        const result = await readGroupsDocs();
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

registerTool(
    'send_email',
    {
        title: 'Send Email Tool',
        description: 'Send email using SMTP via Nodemailer',
        inputSchema: {
            type: 'object',
            properties: {
                to: { type: 'string', format: 'email' },
                subject: { type: 'string' },
                text: { type: 'string' }
            },
            required: ['to', 'subject', 'text']
        },
        outputSchema: {
            type: 'object',
            properties: { result: { type: 'string' } },
            required: ['result']
        }
    },
    async ({ to, subject, text }: {to: string, subject: string, text: string}) => {
        try {
            const smtpUrl = 'smtp://localhost:25';

            const transporter = nodemailer.createTransport(smtpUrl);

            const mailOptions = {
                from: 'lab@redpointpositioning.com',
                to,
                subject,
                text
            };

            await transporter.sendMail(mailOptions);

            return { result: 'Email sent successfully' };
        } catch (error: any) {
            return { result: `Error sending email: ${error.message}` };
        }
    }
);


registerTool(
    'run_js_code',
    {
        title: 'JavaScript Code Execution Tool',
        description: 'Execute provided JavaScript code inside a secure sandbox',
        inputSchema: {
            type: 'object',
            properties: {
                code: { type: 'string' },
            },
            required: ['code']
        },
        outputSchema: {
            type: 'object',
            properties: {
                result: { type: 'string' }
            },
            required: ['result']
        }
    },
    async ({ code }) => {
        try {
            console.log('run_js_code: ', code);
            const numbers = [];
            for (let i = 1; i <= 100; i++) {
                numbers.push(Math.random() * 100);
            }

            const vm = new VM({
                timeout: 1000,
                sandbox: {
                    numbers
                },
                eval: false,
                wasm: false
            });

            const output = vm.run(code);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({ result: String(output) })
                    }
                ]
            };
        } catch (error: any) {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({ result: `Error: ${error.message}` })
                    }
                ]
            };
        }
    }
);


registerTool(
    'run_js_test_suite',
    {
        title: 'JS Test Runner',
        description: 'Run unit tests against a provided JS script. "(() => {${code}})(); (() => {${tests}})();"',
        inputSchema: {
            type: 'object',
            properties: {
                code: { type: 'string' },
                tests: { type: 'string' }
            },
            required: ['code', 'tests']
        },
        outputSchema: {
            type: 'object',
            properties: {
                passed: { type: 'boolean' },
                report: { type: 'string' }
            }
        }
    },
    async ({ code, tests }: any) => {
        try {
            const vm = new VM({ timeout: 2000 });

            // Wrap code + tests inside a single sandbox execution
            const combined = `
                (() => {
                    ${code}
                })();
                
                (() => {
                    ${tests}
                })();
            `;
            console.log(new Date().toISOString());
            const result = vm.run(combined);
            console.log(new Date().toISOString());
            console.log('======================= result ======================');
            console.log(result);

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({ passed: true, report: "All tests passed" })
                }]
            };

        } catch (err: any) {
            console.error('err: ', err);
            console.log(new Date().toISOString());
            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({ passed: false, report: err.stack })
                }]
            };
        }
    }
);

registerTool(
    'save_html_file',
    {
        title: 'Save HTML to File (Hardcoded Path)',
        description: 'Stores provided HTML content into a fixed file path',
        inputSchema: {
            type: 'object',
            properties: {
                html: { type: 'string' }
            },
            required: ['html']
        },
        outputSchema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            },
            required: ['success', 'message']
        }
    },
    async ({ html }: { html: string }) => {
        try {
            // Hardcoded path
            const filePath = path.resolve('./report.html');

            // Ensure directory exists
            const dir = path.dirname(filePath);
            fs.mkdirSync(dir, { recursive: true });

            // Write HTML content
            fs.writeFileSync(filePath, html, 'utf-8');

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({ success: true, message: `HTML saved to ${filePath}` })
                    }
                ]
            };
        } catch (err: any) {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({ success: false, message: err.message })
                    }
                ]
            };
        }
    }
);


registerTool(
    'run_docker_code',
    {
        title: 'Docker Code Execution Tool',
        description: 'Execute code in a Docker container with specified image and language',
        inputSchema: {
            type: 'object',
            properties: {
                image: { type: 'string', description: 'Docker image to use (e.g., python:3.11, node:20, gcc:latest)' },
                code: { type: 'string', description: 'Code to execute' },
                language: {
                    type: 'string',
                    enum: ['python', 'javascript', 'bash', 'c', 'cpp', 'java', 'go', 'rust'],
                    description: 'Programming language'
                },
                timeout: { type: 'number', description: 'Timeout in milliseconds (default 30000)', default: 30000 }
            },
            required: ['image', 'code', 'language']
        },
        outputSchema: {
            type: 'object',
            properties: {
                stdout: { type: 'string' },
                stderr: { type: 'string' },
                exitCode: { type: 'number' },
                error: { type: 'string' }
            }
        }
    },
    async ({ image, code, language, timeout = 30000 }: { image: string, code: string, language: string, timeout?: number }) => {
        try {
            const timestamp = Date.now();
            const filename = `code_${timestamp}`;

            // Map language to file extension and execution command
            const langConfig: Record<string, { ext: string, cmd: string }> = {
                python: { ext: 'py', cmd: 'python' },
                javascript: { ext: 'js', cmd: 'node' },
                bash: { ext: 'sh', cmd: 'bash' },
                c: { ext: 'c', cmd: 'gcc {file} -o /tmp/a.out && /tmp/a.out' },
                cpp: { ext: 'cpp', cmd: 'g++ {file} -o /tmp/a.out && /tmp/a.out' },
                java: { ext: 'java', cmd: 'javac {file} && java -cp /tmp Main' },
                go: { ext: 'go', cmd: 'go run' },
                rust: { ext: 'rs', cmd: 'rustc {file} -o /tmp/a.out && /tmp/a.out' }
            };

            const config = langConfig[language];
            if (!config) {
                throw new Error(`Unsupported language: ${language}`);
            }

            const fileWithExt = `${filename}.${config.ext}`;
            const filePath = `/tmp/${fileWithExt}`;

            // Build docker command
            const execCmd = config.cmd.replace('{file}', filePath);
            const dockerCmd = `docker run --rm -i --network none --memory="256m" --cpus="0.5" -v /tmp:/tmp ${image} sh -c "echo '${code.replace(/'/g, "'\\''")}' > ${filePath} && ${execCmd}"`;

            const { stdout, stderr } = await execAsync(dockerCmd, {
                timeout,
                maxBuffer: 1024 * 1024 // 1MB
            });

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        stdout: stdout.trim(),
                        stderr: stderr.trim(),
                        exitCode: 0
                    })
                }]
            };
        } catch (err: any) {
            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        stdout: err.stdout || '',
                        stderr: err.stderr || '',
                        exitCode: err.code || 1,
                        error: err.message
                    })
                }]
            };
        }
    }
);

registerTool(
    'run_docker_command',
    {
        title: 'Docker Command Execution Tool',
        description: 'Execute arbitrary shell command in a Docker container',
        inputSchema: {
            type: 'object',
            properties: {
                image: { type: 'string', description: 'Docker image to use' },
                command: { type: 'string', description: 'Shell command to execute' },
                timeout: { type: 'number', description: 'Timeout in milliseconds (default 30000)', default: 30000 }
            },
            required: ['image', 'command']
        },
        outputSchema: {
            type: 'object',
            properties: {
                stdout: { type: 'string' },
                stderr: { type: 'string' },
                exitCode: { type: 'number' },
                error: { type: 'string' }
            }
        }
    },
    async ({ image, command, timeout = 30000 }: { image: string, command: string, timeout?: number }) => {
        try {
            const dockerCmd = `docker run --rm -i --network none --memory="256m" --cpus="0.5" ${image} sh -c '${command.replace(/'/g, "'\\''")}`;

            const { stdout, stderr } = await execAsync(dockerCmd, {
                timeout,
                maxBuffer: 1024 * 1024
            });

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        stdout: stdout.trim(),
                        stderr: stderr.trim(),
                        exitCode: 0
                    })
                }]
            };
        } catch (err: any) {
            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        stdout: err.stdout || '',
                        stderr: err.stderr || '',
                        exitCode: err.code || 1,
                        error: err.message
                    })
                }]
            };
        }
    }
);

registerTool(
    'docker_list_images',
    {
        title: 'Docker List Images Tool',
        description: 'List available Docker images on the system',
        inputSchema: { type: 'object', properties: {} },
        outputSchema: {
            type: 'object',
            properties: {
                images: { type: 'array', items: { type: 'object' } }
            }
        }
    },
    async () => {
        try {
            const { stdout } = await execAsync('docker images --format "{{json .}}"');
            const images = stdout.trim().split('\n')
                .filter(line => line)
                .map(line => JSON.parse(line));

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({ images })
                }]
            };
        } catch (err: any) {
            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({ error: err.message, images: [] })
                }]
            };
        }
    }
);

registerTool(
    'run_docker_script',
    {
        title: 'Docker Script Execution Tool',
        description: 'Execute a multi-line script with dependencies in Docker container',
        inputSchema: {
            type: 'object',
            properties: {
                image: { type: 'string', description: 'Docker image to use' },
                script: { type: 'string', description: 'Multi-line script to execute' },
                workdir: { type: 'string', description: 'Working directory (default /tmp)', default: '/tmp' },
                env: { type: 'object', description: 'Environment variables', additionalProperties: { type: 'string' } },
                timeout: { type: 'number', description: 'Timeout in milliseconds (default 60000)', default: 60000 }
            },
            required: ['image', 'script']
        },
        outputSchema: {
            type: 'object',
            properties: {
                stdout: { type: 'string' },
                stderr: { type: 'string' },
                exitCode: { type: 'number' },
                error: { type: 'string' }
            }
        }
    },
    async ({ image, script, workdir = '/tmp', env = {}, timeout = 60000 }: {
        image: string,
        script: string,
        workdir?: string,
        env?: Record<string, string>,
        timeout?: number
    }) => {
        try {
            const envVars = Object.entries(env)
                .map(([key, value]) => `-e ${key}="${value}"`)
                .join(' ');

            const escapedScript = script.replace(/'/g, "'\\''");
            const dockerCmd = `docker run --rm -i --network none --memory="512m" --cpus="1.0" -w ${workdir} ${envVars} ${image} sh -c '${escapedScript}'`;

            const { stdout, stderr } = await execAsync(dockerCmd, {
                timeout,
                maxBuffer: 2 * 1024 * 1024 // 2MB
            });

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        stdout: stdout.trim(),
                        stderr: stderr.trim(),
                        exitCode: 0
                    })
                }]
            };
        } catch (err: any) {
            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        stdout: err.stdout || '',
                        stderr: err.stderr || '',
                        exitCode: err.code || 1,
                        error: err.message
                    })
                }]
            };
        }
    }
);

// generate and execute function plotting bar chart. function takes as argument list of numbers. code you generate will have access to the global var: numbers. result in html store into file.
// run_js_code has access to global var "numbers". plot barchart representing numbers and store this chart into html file using save_html_file tool.
// run_js_code has access to global var "numbers". represent in chart how many numbers in each 10 and store this representation into html file using save_html_file tool.
