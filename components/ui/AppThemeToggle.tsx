"use client";

import { useEffect, useState } from "react";

import { ThemeToggle } from "./ThemeToggle";

export function AppThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDark(false);
      return;
    }

    setIsDark(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      window.localStorage.setItem("theme", "dark");
      return;
    }

    root.classList.remove("dark");
    window.localStorage.setItem("theme", "light");
  }, [isDark]);

  return (
    <ThemeToggle isDark={isDark} onToggle={() => setIsDark((prev) => !prev)} />
  );
}
