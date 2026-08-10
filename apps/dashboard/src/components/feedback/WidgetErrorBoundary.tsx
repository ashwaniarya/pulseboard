import { ErrorState } from "@pulseboard/ui";
import { Component, type ErrorInfo, type ReactNode } from "react";

export interface WidgetErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface WidgetErrorBoundaryState {
  hasCrashed: boolean;
}

export class WidgetErrorBoundary extends Component<
  WidgetErrorBoundaryProps,
  WidgetErrorBoundaryState
> {
  state: WidgetErrorBoundaryState = { hasCrashed: false };

  static getDerivedStateFromError(): WidgetErrorBoundaryState {
    return { hasCrashed: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Widget crashed", error, errorInfo.componentStack);
  }

  handleReset = (): void => {
    this.props.onReset?.();
    this.setState({ hasCrashed: false });
  };

  render(): ReactNode {
    if (this.state.hasCrashed) {
      return (
        <ErrorState
          title="This widget crashed"
          description="The rest of the dashboard keeps working."
          onRetry={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}
