"use client";

import { Button } from "@/components/ui/button";
import { useActiveSectionContext } from "@/context/active-section-context";
import { motion } from "framer-motion";
import React from "react";
import { TfiAngleDown } from "react-icons/tfi";

const DownButton = () => {
  const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext();
  return (
    <motion.div
      className="absolute bottom-44 left-1/2 transform -translate-x-1/2 animate-bounce"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Button
        asChild
        variant="outline"
        size={"lg"}
        svgSize="lg"
        className="rounded-full w-11 h-11 p-0 shadow-2xl"
      >
        <a
          href="#about"
          onClick={() => {
            setActiveSection("About");
            setTimeOfLastClick(Date.now());
          }}
        >
          <TfiAngleDown className="pt-1" />
        </a>
      </Button>
    </motion.div>
  );
};

export default DownButton;
