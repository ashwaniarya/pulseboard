import { Button, EmptyState } from "@pulseboard/ui";
import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <EmptyState
      className="min-h-64"
      title="There's no page here"
      description="The address may be outdated."
      action={
        <Button variant="secondary" size="small" className="px-0">
          <Link to="/" className="px-3">
            Back to Overview
          </Link>
        </Button>
      }
    />
  );
}
