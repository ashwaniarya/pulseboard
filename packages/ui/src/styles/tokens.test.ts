// @vitest-environment node
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const tokensCss = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");

type TokenMap = Record<string, string>;

function extractBlock(css: string, selectorStart: string): string {
  const startIndex = css.indexOf(selectorStart);
  if (startIndex === -1) {
    throw new Error(`selector ${selectorStart} not found in tokens.css`);
  }
  const openBrace = css.indexOf("{", startIndex);
  let depth = 0;
  for (let index = openBrace; index < css.length; index += 1) {
    if (css[index] === "{") {
      depth += 1;
    }
    if (css[index] === "}") {
      depth -= 1;
      if (depth === 0) {
        return css.slice(openBrace + 1, index);
      }
    }
  }
  throw new Error(`unterminated block for ${selectorStart}`);
}

function parseTokens(block: string): TokenMap {
  const tokens: TokenMap = {};
  const declarationPattern = /--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g;
  for (const match of block.matchAll(declarationPattern)) {
    const name = match[1];
    const value = match[2];
    if (name !== undefined && value !== undefined) {
      tokens[name] = value;
    }
  }
  return tokens;
}

function channelToLinear(channelByte: number): number {
  const channel = channelByte / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hexColor: string): number {
  const red = channelToLinear(Number.parseInt(hexColor.slice(1, 3), 16));
  const green = channelToLinear(Number.parseInt(hexColor.slice(3, 5), 16));
  const blue = channelToLinear(Number.parseInt(hexColor.slice(5, 7), 16));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(firstHex: string, secondHex: string): number {
  const lighter = Math.max(relativeLuminance(firstHex), relativeLuminance(secondHex));
  const darker = Math.min(relativeLuminance(firstHex), relativeLuminance(secondHex));
  return (lighter + 0.05) / (darker + 0.05);
}

const lightTokens = parseTokens(extractBlock(tokensCss, ":root"));
const darkTokens = parseTokens(extractBlock(tokensCss, '[data-theme="dark"]'));

const REQUIRED_TOKEN_NAMES = [
  "surface",
  "surface-raised",
  "surface-sunken",
  "text-primary",
  "text-muted",
  "text-inverted",
  "outline",
  "outline-strong",
  "accent",
  "accent-hover",
  "accent-foreground",
  "positive",
  "positive-surface",
  "negative",
  "negative-surface",
  "warning",
  "warning-surface",
  "focus-ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-6",
];

interface ContrastRequirement {
  foreground: string;
  background: string;
  minimumRatio: number;
}

const CONTRAST_REQUIREMENTS: ContrastRequirement[] = [
  { foreground: "text-primary", background: "surface", minimumRatio: 4.5 },
  { foreground: "text-primary", background: "surface-raised", minimumRatio: 4.5 },
  { foreground: "text-muted", background: "surface", minimumRatio: 4.5 },
  { foreground: "text-muted", background: "surface-raised", minimumRatio: 4.5 },
  { foreground: "accent-foreground", background: "accent", minimumRatio: 4.5 },
  { foreground: "positive", background: "surface", minimumRatio: 4.5 },
  { foreground: "negative", background: "surface", minimumRatio: 4.5 },
  { foreground: "warning", background: "surface", minimumRatio: 4.5 },
  { foreground: "chart-1", background: "surface", minimumRatio: 3 },
  { foreground: "chart-2", background: "surface", minimumRatio: 3 },
  { foreground: "chart-3", background: "surface", minimumRatio: 3 },
  { foreground: "chart-4", background: "surface", minimumRatio: 3 },
  { foreground: "chart-5", background: "surface", minimumRatio: 3 },
  { foreground: "chart-6", background: "surface", minimumRatio: 3 },
];

describe.each([
  ["light", lightTokens],
  ["dark", darkTokens],
])("%s theme tokens", (themeName, tokens) => {
  it("defines every semantic token as six-digit hex", () => {
    for (const tokenName of REQUIRED_TOKEN_NAMES) {
      expect(tokens[tokenName], `${themeName} --${tokenName}`).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it.each(CONTRAST_REQUIREMENTS)(
    "keeps --$foreground on --$background at $minimumRatio:1 or better",
    ({ foreground, background, minimumRatio }) => {
      const foregroundHex = tokens[foreground];
      const backgroundHex = tokens[background];
      if (foregroundHex === undefined || backgroundHex === undefined) {
        throw new Error(`missing token pair --${foreground} / --${background} in ${themeName}`);
      }
      const ratio = contrastRatio(foregroundHex, backgroundHex);
      expect(
        ratio,
        `${themeName}: --${foreground} ${foregroundHex} on --${background} ${backgroundHex} is ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(minimumRatio);
    },
  );
});

describe("tailwind mapping", () => {
  it("wipes the default palette before mapping semantic colors", () => {
    expect(tokensCss).toContain("--color-*: initial");
  });

  it("maps every semantic token into the tailwind color namespace", () => {
    for (const tokenName of REQUIRED_TOKEN_NAMES) {
      expect(tokensCss).toContain(`--color-${tokenName}: var(--${tokenName})`);
    }
  });
});
