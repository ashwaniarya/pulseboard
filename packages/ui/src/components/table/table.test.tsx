import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Pagination } from "../pagination/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "./table";

describe("TableHeaderCell", () => {
  it("exposes aria-sort and toggles through its button", async () => {
    const user = userEvent.setup();
    const handleSortToggle = vi.fn();
    render(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell sortDirection="desc" onSortToggle={handleSortToggle}>
              Wait
            </TableHeaderCell>
            <TableHeaderCell>Caller</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell numeric>42</TableCell>
            <TableCell>Olivia Anderson</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const sortedHeader = screen.getByRole("columnheader", { name: /Wait/ });
    expect(sortedHeader).toHaveAttribute("aria-sort", "descending");
    await user.click(screen.getByRole("button", { name: /Wait/ }));
    expect(handleSortToggle).toHaveBeenCalledTimes(1);
  });

  it("right-aligns numeric cells with tabular figures", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell numeric>1,184</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole("cell", { name: "1,184" }).className).toContain("numeric-data");
  });
});

describe("Pagination", () => {
  it("disables bounds and reports the position", async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();
    render(<Pagination page={1} totalPages={12} onPageChange={handlePageChange} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByText("Page 1 of 12")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it("disables next on the last page", () => {
    render(<Pagination page={12} totalPages={12} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });
});
