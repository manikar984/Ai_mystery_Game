import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./ui/App";
import "./ui.css";

createRoot(document.getElementById("root")!).render(<React.StrictMode><<BrowserRouter basename="/Ai_mystery_Game">><App /></BrowserRouter></React.StrictMode>);
