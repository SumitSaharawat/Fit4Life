import { Component } from "react";
export default class ErrorBoundary extends Component {
  state = { err: null };
  static getDerivedStateFromError(err){ return { err }; }
  render(){
    if (this.state.err) return (
      <pre style="white-space:pre-wrap;padding:16px;background:#220;color:#faa">
        {String(this.state.err.stack || this.state.err)}
      </pre>
    );
    return this.props.children;
  }
}
