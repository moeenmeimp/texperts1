import { useCallback, useEffect, useState } from "react";

export const PALETTES = [
  { id: "emerald", label: "Emerald Trade", swatch: "#2f9e6e" },
  { id: "ocean", label: "Ocean Blue", swatch: "#2b74c9" },
  { id: "midnight", label: "Midnight Indigo", swatch: "#5b5bd6" },
  { id: "amber", label: "Desert Amber", swatch: "#c07a24" },
  { id: "rose", label: "Rose Clay", swatch: "#c04f5a" },
  { id: "slate", label: "Graphite", swatch: "#5b6472" },
] as const;

export type PaletteId = (typeof PALETTES)[number]["id"];

const STORAGE_KEY = "app-color-mode";

export function useColorMode() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(stored ? stored === "dark" : prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const toggle = useCallback(() => {
    setDark((prev) => {
      window.localStorage.setItem(STORAGE_KEY, prev ? "light" : "dark");
      return !prev;
    });
  }, []);

  return { dark, toggle };
}

export function usePalette(palette: string | undefined) {
  useEffect(() => {
    document.documentElement.setAttribute("data-palette", palette ?? "emerald");
  }, [palette]);
}
