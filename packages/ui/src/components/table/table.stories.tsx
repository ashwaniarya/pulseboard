import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { Pagination } from "../pagination/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  type TableSortDirection,
} from "./table";

const CALL_ROWS = [
  { caller: "Olivia Anderson", status: "Answered", waitSeconds: 12, durationSeconds: 245 },
  { caller: "Mateo Garcia", status: "Missed", waitSeconds: 48, durationSeconds: 0 },
  { caller: "Priya Patel", status: "Voicemail", waitSeconds: 31, durationSeconds: 42 },
  { caller: "Andre Willis", status: "Answered", waitSeconds: 8, durationSeconds: 512 },
];

function SortableCallsTable() {
  const [sortDirection, setSortDirection] = useState<TableSortDirection>("desc");
  const [page, setPage] = useState(1);
  const sortedRows = [...CALL_ROWS].sort((first, second) =>
    sortDirection === "asc"
      ? first.waitSeconds - second.waitSeconds
      : second.waitSeconds - first.waitSeconds,
  );
  return (
    <div className="w-[36rem] space-y-3">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Caller</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell
              numeric
              sortDirection={sortDirection}
              onSortToggle={() => {
                setSortDirection(sortDirection === "desc" ? "asc" : "desc");
              }}
            >
              Wait (s)
            </TableHeaderCell>
            <TableHeaderCell numeric>Duration (s)</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRows.map((row) => (
            <TableRow key={row.caller}>
              <TableCell>{row.caller}</TableCell>
              <TableCell className="text-text-muted">{row.status}</TableCell>
              <TableCell numeric>{row.waitSeconds}</TableCell>
              <TableCell numeric>{row.durationSeconds}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination page={page} totalPages={9} onPageChange={setPage} />
    </div>
  );
}

const meta = {
  title: "Patterns/Table",
  component: Table,
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SortableWithPagination: Story = {
  render: () => <SortableCallsTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const waitHeader = canvas.getByRole("columnheader", { name: /Wait/ });
    await expect(waitHeader).toHaveAttribute("aria-sort", "descending");
    await userEvent.click(canvas.getByRole("button", { name: /Wait/ }));
    await expect(waitHeader).toHaveAttribute("aria-sort", "ascending");

    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    await expect(canvas.getByText("Page 2 of 9")).toBeInTheDocument();
  },
};
