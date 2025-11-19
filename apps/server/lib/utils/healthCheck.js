"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSystemHealthCheck = runSystemHealthCheck;
var os_1 = require("os");
var child_process_1 = require("child_process");
function runSystemHealthCheck() {
    var totalMem = os_1.default.totalmem();
    var freeMem = os_1.default.freemem();
    var usedMemPercent = ((totalMem - freeMem) / totalMem) * 100;
    var diskUsage;
    try {
        // works on Linux/macOS; for Windows, replace with `wmic logicaldisk get size,freespace,caption`
        diskUsage = (0, child_process_1.execSync)('df -h / | tail -1 | awk \'{print $5}\'')
            .toString()
            .trim();
    }
    catch (_a) {
        diskUsage = undefined;
    }
    return {
        hostname: os_1.default.hostname(),
        platform: "".concat(os_1.default.type(), " ").concat(os_1.default.release()),
        uptimeMinutes: Math.round(os_1.default.uptime() / 60),
        loadAverage: os_1.default.loadavg(),
        cpuCount: os_1.default.cpus().length,
        totalMemoryMB: Math.round(totalMem / 1024 / 1024),
        freeMemoryMB: Math.round(freeMem / 1024 / 1024),
        usedMemoryPercent: parseFloat(usedMemPercent.toFixed(2)),
        diskUsage: diskUsage,
    };
}
