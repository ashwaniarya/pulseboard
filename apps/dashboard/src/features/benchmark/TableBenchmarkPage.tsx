import { generateDataset } from "@pulseboard/mock-api/data";
import {
  Button,
  Card,
  KpiStatTile,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@pulseboard/ui";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo, useRef, useState } from "react";

import { formatCount } from "../../lib/formatters";
import { todayIsoDate } from "../../lib/dateRange";
import { useFrameTimingProbe } from "./useFrameTimingProbe";

const BENCHMARK_DAY_COUNT = 110;
const ROW_HEIGHT_PX = 41;

export function TableBenchmarkPage() {
  const mountStartRef = useRef(performance.now());
  const [mountMilliseconds, setMountMilliseconds] = useState<number | null>(null);
  const { result: frameResult, isProbing, probeDuring } = useFrameTimingProbe();

  const benchmarkRecords = useMemo(
    () => generateDataset({ endDate: todayIsoDate(), dayCount: BENCHMARK_DAY_COUNT }).callRecords,
    [],
  );

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: benchmarkRecords.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_HEIGHT_PX,
    overscan: 10,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const lastVirtualRow = virtualRows[virtualRows.length - 1];

  useEffect(() => {
    setMountMilliseconds(Math.round((performance.now() - mountStartRef.current) * 10) / 10);
  }, []);

  const runScrollBenchmark = () => {
    void probeDuring(async () => {
      const container = scrollContainerRef.current;
      if (container === null) {
        return;
      }
      const totalHeight = rowVirtualizer.getTotalSize();
      const steps = 60;
      for (let step = 0; step <= steps; step += 1) {
        container.scrollTop = (totalHeight / steps) * step;
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      container.scrollTop = 0;
    });
  };

  return (
    <div className="space-y-4 p-6">
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Virtualized table benchmark</h2>
          <p className="text-sm text-text-muted">
            {formatCount(benchmarkRecords.length)} in-memory call records rendered through the same
            table the Calls page uses — no network, pure render cost.
          </p>
        </div>
        <Button onClick={runScrollBenchmark} isLoading={isProbing}>
          Run scroll benchmark
        </Button>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiStatTile
          label="Mount time"
          value={mountMilliseconds === null ? "…" : `${String(mountMilliseconds)}ms`}
        />
        <KpiStatTile label="Rows in DOM" value={formatCount(virtualRows.length)} />
        <KpiStatTile
          label="p95 frame (scripted scroll)"
          value={frameResult === null ? "run it" : `${String(frameResult.p95FrameMs)}ms`}
        />
      </div>
      <div ref={scrollContainerRef} className="max-h-[520px] overflow-y-auto rounded-large">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Caller</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell numeric>Wait (s)</TableHeaderCell>
              <TableHeaderCell numeric>Duration (s)</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {virtualRows[0] !== undefined && (
              <tr aria-hidden>
                <td colSpan={4} style={{ height: virtualRows[0].start, padding: 0 }} />
              </tr>
            )}
            {virtualRows.map((virtualRow) => {
              const record = benchmarkRecords[virtualRow.index];
              if (record === undefined) {
                return null;
              }
              return (
                <TableRow key={record.id}>
                  <TableCell>{record.callerName}</TableCell>
                  <TableCell className="text-text-muted">{record.status}</TableCell>
                  <TableCell numeric>{record.waitSeconds}</TableCell>
                  <TableCell numeric>{record.durationSeconds}</TableCell>
                </TableRow>
              );
            })}
            {lastVirtualRow !== undefined && (
              <tr aria-hidden>
                <td
                  colSpan={4}
                  style={{
                    height: rowVirtualizer.getTotalSize() - lastVirtualRow.end,
                    padding: 0,
                  }}
                />
              </tr>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export const Component = TableBenchmarkPage;
