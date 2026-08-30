import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./redux/store";
import { ThemeProvider } from "./context/ThemeContext";
import { PreferencesProvider } from "./context/PreferencesContext";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <PreferencesProvider>
          <BrowserRouter>
            <App />
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: "var(--surface)",
                  color: "var(--ink)",
                  border: "1px solid var(--border)",
                  fontSize: "14px",
                },
                success: { iconTheme: { primary: "#7FE0B5", secondary: "var(--surface)" } },
                error: { iconTheme: { primary: "#E8543D", secondary: "var(--surface)" } },
              }}
            />
          </BrowserRouter>
        </PreferencesProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);