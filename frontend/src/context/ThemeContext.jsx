import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themePref, setThemePref] = useState(() => localStorage.getItem("themePref") || "system");
  const [resolvedTheme, setResolvedTheme] = useState("dark");

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const actual = themePref === "system" ? (mql.matches ? "dark" : "light") : themePref;
      setResolvedTheme(actual);
      document.documentElement.setAttribute("data-theme", actual);
    };

    applyTheme();
    localStorage.setItem("themePref", themePref);

    if (themePref === "system") {
      mql.addEventListener("change", applyTheme);
      return () => mql.removeEventListener("change", applyTheme);
    }
  }, [themePref]);

  const setTheme = (value) => setThemePref(value);
  const toggleTheme = () => setThemePref(resolvedTheme === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme: resolvedTheme, themePref, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}