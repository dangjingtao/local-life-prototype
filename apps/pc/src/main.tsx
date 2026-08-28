import React from "react";
import ReactDOM from "react-dom/client";
import "@prototype/design-system/tokens.css";
import "./styles.css";
import { App } from "./App";
import { OperatorConsole } from "./OperatorConsole";

const role = new URLSearchParams(window.location.search).get("role");
const root = role === "merchant" || role === "management" ? <App /> : <OperatorConsole />;

ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode>{root}</React.StrictMode>);
