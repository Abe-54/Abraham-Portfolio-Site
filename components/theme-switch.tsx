"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/theme-context";
import React from "react";
import { BsMoon, BsSun } from "react-icons/bs";

const ThemeSwitch = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      aria-pressed={theme === "dark"}
      aria-label={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      className="fixed bottom-5 right-5 size-12 rounded-full p-0"
      variant="secondary"
    >
      {theme === "light" ? <BsSun aria-hidden /> : <BsMoon aria-hidden />}
    </Button>
  );
};

export default ThemeSwitch;
