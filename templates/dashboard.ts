import { page, container, header, row, stat, card, chart, table, col, badge, dataset } from "claw2ui/dsl"

export default page("System Dashboard", [
  container(
    header("System Dashboard", "Real-time overview"),
    row(4,
      stat("CPU Usage", "42%", { change: -5.2, icon: "🖥️" }),
      stat("Memory", "6.2 GB", { change: 3.1, icon: "💾" }),
      stat("Disk I/O", "120 MB/s", { change: 15.0, icon: "💿" }),
      stat("Network", "45 Mbps", { change: -2.3, icon: "🌐" }),
    ),
    row(2,
      card("CPU Usage (24h)",
        chart("line", {
          labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"],
          datasets: [dataset("CPU %", [25, 18, 35, 65, 72, 58, 42], {
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: true,
            tension: 0.4,
          })],
        }, { height: 250 }),
      ),
      card("Memory Allocation",
        chart("doughnut", {
          labels: ["Used", "Cached", "Buffers", "Free"],
          datasets: [{
            data: [6.2, 3.5, 1.8, 4.5],
            backgroundColor: [
              "rgb(239, 68, 68)",
              "rgb(249, 115, 22)",
              "rgb(234, 179, 8)",
              "rgb(34, 197, 94)",
            ],
          }],
        }, { height: 250 }),
      ),
    ),
    card("Service Status",
      table(
        [
          col("service", "Service"),
          badge("status", "Status", { Running: "success", Stopped: "error", Starting: "warning" }),
          col("cpu", "CPU", "percent"),
          col("memory", "Memory"),
          col("uptime", "Uptime"),
        ],
        [
          { service: "nginx", status: "Running", cpu: 2.1, memory: "128 MB", uptime: "15d 4h" },
          { service: "postgres", status: "Running", cpu: 8.5, memory: "1.2 GB", uptime: "15d 4h" },
          { service: "redis", status: "Running", cpu: 1.2, memory: "256 MB", uptime: "15d 4h" },
          { service: "worker-1", status: "Running", cpu: 15.3, memory: "512 MB", uptime: "3d 12h" },
          { service: "worker-2", status: "Stopped", cpu: 0, memory: "0 MB", uptime: "-" },
          { service: "cron", status: "Running", cpu: 0.5, memory: "64 MB", uptime: "15d 4h" },
        ],
      ),
    ),
  ),
])
