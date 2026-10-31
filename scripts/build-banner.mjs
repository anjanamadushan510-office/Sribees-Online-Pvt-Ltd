#!/usr/bin/env node

/**
 * Sribees Online - Styled Build Banner
 * Displays a filled, bold ASCII art banner with build metadata when building the application.
 */

// ANSI Color Codes
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

const AMBER = "\x1b[38;2;245;158;11m";
const GOLD = "\x1b[38;2;251;191;36m";
const LIGHT_GOLD = "\x1b[38;2;252;211;77m";
const YELLOW = "\x1b[38;2;253;224;71m";
const CYAN = "\x1b[38;2;56;189;248m";
const GREEN = "\x1b[38;2;74;222;128m";
const GRAY = "\x1b[38;2;156;163;175m";
const DARK_GRAY = "\x1b[38;2;75;85;99m";

// Filled block font for "SRIBEES ONLINE" (exact width: 104 characters)
const bannerLines = [
  "  ███████╗██████╗ ██╗██████╗ ███████╗███████╗███████╗    ██████╗ ███╗   ██╗██╗     ██╗███╗   ██╗███████╗",
  "  ██╔════╝██╔══██╗██║██╔══██╗██╔════╝██╔════╝██╔════╝   ██╔═══██╗████╗  ██║██║     ██║████╗  ██║██╔════╝",
  "  ███████╗██████╔╝██║██████╔╝█████╗  █████╗  ███████╗   ██║   ██║██╔██╗ ██║██║     ██║██╔██╗ ██║█████╗  ",
  "  ╚════██║██╔══██╗██║██╔══██╗██╔══╝  ██╔══╝  ╚════██║   ██║   ██║██║╚██╗██║██║     ██║██║╚██╗██║██╔══╝  ",
  "  ███████║██║  ██║██║██████╔╝███████╗███████╗███████║   ╚██████╔╝██║ ╚████║███████╗██║██║ ╚████║███████╗",
  "  ╚══════╝╚═╝  ╚═╝╚═╝╚═════╝ ╚══════╝╚══════╝╚══════╝    ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝",
];

const gradientColors = [AMBER, GOLD, LIGHT_GOLD, YELLOW, GOLD, AMBER];

// Strip ANSI escape codes to measure true printable width
function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

// Calculate visual column width (accounts for emojis and standard chars)
function visualWidth(str) {
  const clean = stripAnsi(str);
  let w = 0;
  for (const ch of clean) {
    const code = ch.codePointAt(0) || 0;
    if (code > 0x1f000 || (code >= 0x25a0 && code <= 0x25ff)) {
      w += 2;
    } else {
      w += 1;
    }
  }
  return w;
}

function padLine(content, totalInnerWidth) {
  const vWidth = visualWidth(content);
  const remaining = Math.max(0, totalInnerWidth - vWidth);
  return content + " ".repeat(remaining);
}

function printBanner() {
  const innerWidth = 108;
  const borderH = "─".repeat(innerWidth);

  console.log("");
  console.log(`${DARK_GRAY}╭${borderH}╮${RESET}`);

  // 1. Filled ASCII Art with Rich Amber/Gold Gradient
  bannerLines.forEach((line, index) => {
    const color = gradientColors[index % gradientColors.length];
    const coloredLine = `  ${BOLD}${color}${line}${RESET}`;
    console.log(`${DARK_GRAY}│${RESET}${padLine(coloredLine, innerWidth)}${DARK_GRAY}│${RESET}`);
  });

  console.log(`${DARK_GRAY}├${borderH}┤${RESET}`);

  // 2. Badges Header
  const leftBadge = `  ${AMBER}🐝 SRIBEEES ONLINE${RESET} ${DIM}•${RESET} ${CYAN}E-COMMERCE STOREFRONT PLATFORM${RESET}`;
  const rightBadge = `${GREEN}● OPTIMIZED PRODUCTION BUILD${RESET}  `;
  const spaceNeeded = innerWidth - visualWidth(leftBadge) - visualWidth(rightBadge);
  const badgeRow = `${leftBadge}${" ".repeat(Math.max(1, spaceNeeded))}${rightBadge}`;
  console.log(`${DARK_GRAY}│${RESET}${badgeRow}${DARK_GRAY}│${RESET}`);

  console.log(`${DARK_GRAY}├${borderH}┤${RESET}`);

  // 3. Build & System Metadata
  const nodeEnv = process.env.NODE_ENV || "production";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.sribees.com";
  const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC";
  const nodeVersion = process.version;

  const metaRows = [
    { label: "Environment", value: `${CYAN}${nodeEnv}${RESET}` },
    { label: "Node.js", value: `${YELLOW}${nodeVersion}${RESET}` },
    { label: "API Base URL", value: `${GRAY}${apiUrl}${RESET}` },
    { label: "Build Timestamp", value: `${GRAY}${timestamp}${RESET}` },
  ];

  metaRows.forEach(({ label, value }) => {
    const rowContent = `  ${DIM}${label.padEnd(17)}:${RESET} ${value}`;
    console.log(`${DARK_GRAY}│${RESET}${padLine(rowContent, innerWidth)}${DARK_GRAY}│${RESET}`);
  });

  console.log(`${DARK_GRAY}╰${borderH}╯${RESET}`);
  console.log("");
}

printBanner();
