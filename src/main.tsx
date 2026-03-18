import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import WalletProviders from "@/providers/WalletProviders";
import ModalProvider from "@/providers/modal-provider";
import "@/styles/index.css";
import App from "@/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <WalletProviders>
        <App />
        <ModalProvider />
      </WalletProviders>
    </BrowserRouter>
  </StrictMode>,
);
