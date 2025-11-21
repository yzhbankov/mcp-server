import os from 'os';
import {execSync} from 'child_process';

export interface SystemHealth {
    hostname: string;
    platform: string;
    uptimeMinutes: number;
    loadAverage: number[];
    cpuCount: number;
    totalMemoryMB: number;
    freeMemoryMB: number;
    usedMemoryPercent: number;
    diskUsage?: string;
}

export function runSystemHealthCheck(): SystemHealth {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMemPercent = ((totalMem - freeMem) / totalMem) * 100;

    let diskUsage: string | undefined;
    try {
        // works on Linux/macOS; for Windows, replace with `wmic logicaldisk get size,freespace,caption`
        diskUsage = execSync('df -h / | tail -1 | awk \'{print $5}\'')
            .toString()
            .trim();
    } catch {
        diskUsage = undefined;
    }

    return {
        hostname: os.hostname(),
        platform: `${os.type()} ${os.release()}`,
        uptimeMinutes: Math.round(os.uptime() / 60),
        loadAverage: os.loadavg(),
        cpuCount: os.cpus().length,
        totalMemoryMB: Math.round(totalMem / 1024 / 1024),
        freeMemoryMB: Math.round(freeMem / 1024 / 1024),
        usedMemoryPercent: parseFloat(usedMemPercent.toFixed(2)),
        diskUsage,
    };
}
