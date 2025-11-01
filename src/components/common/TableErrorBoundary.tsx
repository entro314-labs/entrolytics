import { Component, ErrorInfo, ReactNode } from "react";
import { Column, Text } from "@entro314labs/entro-zen";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class TableErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("🚨 TableErrorBoundary caught an error:", {
			error: error.message,
			stack: error.stack,
			componentStack: errorInfo.componentStack,
			props: this.props,
		});

		// Store error info for debugging
		this.setState({ error });
	}

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<Column padding="4" alignItems="center" gap="2">
						<Text weight="semi-bold">Data Loading Error</Text>
						<Text>
							There was an issue loading the table data. Please refresh the
							page.
						</Text>
						{process.env.NODE_ENV === "development" && this.state.error && (
							<details style={{ marginTop: "16px", width: "100%" }}>
								<summary style={{ cursor: "pointer", fontSize: "14px" }}>
									Error Details (Development Only)
								</summary>
								<pre
									style={{
										fontSize: "12px",
										color: "#666",
										padding: "8px",
										backgroundColor: "#f5f5f5",
										borderRadius: "4px",
										marginTop: "8px",
										overflow: "auto",
										maxHeight: "200px",
									}}
								>
									{this.state.error.message}
									{"\n\n"}
									{this.state.error.stack}
								</pre>
							</details>
						)}
					</Column>
				)
			);
		}

		return this.props.children;
	}
}
