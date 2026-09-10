import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="fatal">
          <h1>Flow Clock needs a refresh</h1>
          <p>
            Something unexpected happened. Your saved data has not been cleared.
          </p>
          <button onClick={() => window.location.reload()}>
            Reload Flow Clock
          </button>
        </main>
      );
    return this.props.children;
  }
}
