import ErrorPage from "@/components/error-page/error-page.component";
import { storageService } from "@/services";
import { Component } from "react";

import { safePushError } from "@/lib/faro";
import { isChunkLoadError, tryRecoverFromChunkError } from "@/utils/chunk-error-recovery";

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    if (isChunkLoadError(error)) {
      const recovered = tryRecoverFromChunkError();
      if (recovered) {
        return { hasError: false };
      }
    }

    return { hasError: true };
  }

  public componentDidCatch(error: Error, _errorInfo: React.ErrorInfo) {
    if (isChunkLoadError(error)) {
      return;
    }

    safePushError(error, { source: "ErrorBoundary" });
    storageService.clearLocal();
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    const { children } = this.props;

    if (this.state.hasError) {
      return <ErrorPage variant="500" onPrimaryAction={this.handleRetry} />;
    }

    return children;
  }
}

export default ErrorBoundary;
