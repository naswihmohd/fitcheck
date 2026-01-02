import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Show toast with error message
    // toast.error("Something went wrong");
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      // Optionally, you can render a specific fallback UI here
      return (
        <div className='flex justify-center items-center h-svh w-full text-center'>
          <h1>Something went wrong. Please refresh the page or try again later.</h1>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary