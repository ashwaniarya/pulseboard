import { useEffect, useState } from "react";

interface TokenRow {
  tokenName: string;
  pairedWith: string;
  minimumRatio: number;
}

const TOKEN_ROWS: readonly TokenRow[] = [
  { tokenName: "text-primary", pairedWith: "surface", minimumRatio: 4.5 },
  { tokenName: "text-muted", pairedWith: "surface", minimumRatio: 4.5 },
  { tokenName: "accent", pairedWith: "surface", minimumRatio: 3 },
  { tokenName: "accent-foreground", pairedWith: "accent", minimumRatio: 4.5 },
  { tokenName: "positive", pairedWith: "surface", minimumRatio: 4.5 },
  { tokenName: "negative", pairedWith: "surface", minimumRatio: 4.5 },
  { tokenName: "warning", pairedWith: "surface", minimumRatio: 4.5 },
  { tokenName: "chart-1", pairedWith: "surface", minimumRatio: 3 },
  { tokenName: "chart-2", pairedWith: "surface", minimumRatio: 3 },
  { tokenName: "chart-3", pairedWith: "surface", minimumRatio: 3 },
  { tokenName: "chart-4", pairedWith: "surface", minimumRatio: 3 },
  { tokenName: "chart-5", pairedWith: "surface", minimumRatio: 3 },
  { tokenName: "chart-6", pairedWith: "surface", minimumRatio: 3 },
];

function channelToLinear(channelByte: number): number {
  const channel = channelByte / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function luminanceOfCssColor(cssColor: string): number | null {
  const match = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(cssColor);
  if (match === null) {
    return null;
  }
  const [, red, green, blue] = match;
  if (red === undefined || green === undefined || blue === undefined) {
    return null;
  }
  return (
    0.2126 * channelToLinear(Number(red)) +
    0.7152 * channelToLinear(Number(green)) +
    0.0722 * channelToLinear(Number(blue))
  );
}

function contrastBetween(first: string, second: string): number | null {
  const firstLuminance = luminanceOfCssColor(first);
  const secondLuminance = luminanceOfCssColor(second);
  if (firstLuminance === null || secondLuminance === null) {
    return null;
  }
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function readResolvedTokens(): Record<string, string> {
  const probe = document.createElement("div");
  document.body.appendChild(probe);
  const resolved: Record<string, string> = {};
  const tokenNames = new Set<string>();
  for (const row of TOKEN_ROWS) {
    tokenNames.add(row.tokenName);
    tokenNames.add(row.pairedWith);
  }
  for (const tokenName of tokenNames) {
    probe.style.color = `var(--${tokenName})`;
    resolved[tokenName] = getComputedStyle(probe).color;
  }
  probe.remove();
  return resolved;
}

export function ColorTokenGrid() {
  const [resolvedTokens, setResolvedTokens] = useState<Record<string, string>>({});

  useEffect(() => {
    setResolvedTokens(readResolvedTokens());
    const observer = new MutationObserver(() => {
      setResolvedTokens(readResolvedTokens());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-outline-strong text-left">
          <th className="py-2 pr-4 font-semibold">Token</th>
          <th className="py-2 pr-4 font-semibold">Swatch</th>
          <th className="py-2 pr-4 font-semibold">Checked against</th>
          <th className="py-2 pr-4 font-semibold">Contrast</th>
          <th className="py-2 font-semibold">Requirement</th>
        </tr>
      </thead>
      <tbody>
        {TOKEN_ROWS.map((row) => {
          const foreground = resolvedTokens[row.tokenName];
          const background = resolvedTokens[row.pairedWith];
          const ratio =
            foreground !== undefined && background !== undefined
              ? contrastBetween(foreground, background)
              : null;
          const passes = ratio !== null && ratio >= row.minimumRatio;
          return (
            <tr key={row.tokenName} className="border-b border-outline">
              <td className="py-2 pr-4 font-mono">--{row.tokenName}</td>
              <td className="py-2 pr-4">
                <span
                  aria-hidden
                  className="inline-block h-6 w-10 rounded-small border border-outline"
                  style={{ backgroundColor: `var(--${row.tokenName})` }}
                />
              </td>
              <td className="py-2 pr-4 font-mono">--{row.pairedWith}</td>
              <td className="py-2 pr-4 numeric-data">
                {ratio === null ? "…" : `${ratio.toFixed(2)}:1`}
              </td>
              <td className="py-2">
                {passes ? `passes ≥ ${row.minimumRatio}:1` : `needs ≥ ${row.minimumRatio}:1`}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
