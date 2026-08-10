import type { Meta, StoryObj } from "@storybook/react-vite";

import { Skeleton } from "./skeleton";

const meta = {
  title: "Primitives/Skeleton",
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextLines: Story = {
  render: () => (
    <div className="w-64 space-y-2">
      <Skeleton shape="text" />
      <Skeleton shape="text" className="w-4/5" />
      <Skeleton shape="text" className="w-2/3" />
    </div>
  ),
};

export const TileLayout: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Skeleton shape="circle" className="size-10" />
      <div className="space-y-2">
        <Skeleton shape="rectangle" className="h-4 w-40" />
        <Skeleton shape="rectangle" className="h-8 w-28" />
      </div>
    </div>
  ),
};
