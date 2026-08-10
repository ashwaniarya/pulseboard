import { useCallback, useRef, useState } from "react";

export function percentile(sortedValues: readonly number[], fraction: number): number {
  if (sortedValues.length === 0) {
    return 0;
  }
  const index = Math.min(
    sortedValues.length - 1,
    Math.max(0, Math.ceil(fraction * sortedValues.length) - 1),
  );
  return sortedValues[index] ?? 0;
}

export interface FrameTimingResult {
  sampleCount: number;
  p95FrameMs: number;
  worstFrameMs: number;
}

export function useFrameTimingProbe() {
  const [result, setResult] = useState<FrameTimingResult | null>(null);
  const [isProbing, setIsProbing] = useState(false);
  const frameDeltasRef = useRef<number[]>([]);

  const probeDuring = useCallback(async (action: () => Promise<void>) => {
    frameDeltasRef.current = [];
    setIsProbing(true);
    setResult(null);
    let previousTimestamp = performance.now();
    let keepSampling = true;
    const sample = (timestamp: number) => {
      frameDeltasRef.current.push(timestamp - previousTimestamp);
      previousTimestamp = timestamp;
      if (keepSampling) {
        requestAnimationFrame(sample);
      }
    };
    requestAnimationFrame(sample);
    await action();
    keepSampling = false;
    const sorted = [...frameDeltasRef.current].sort((first, second) => first - second);
    setResult({
      sampleCount: sorted.length,
      p95FrameMs: Math.round(percentile(sorted, 0.95) * 10) / 10,
      worstFrameMs: Math.round((sorted[sorted.length - 1] ?? 0) * 10) / 10,
    });
    setIsProbing(false);
  }, []);

  return { result, isProbing, probeDuring };
}
