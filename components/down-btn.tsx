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
      className="relative w-full h-0 flex justify-center"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Button
        asChild
        variant="secondary"
        className="absolute bottom-40 sm:bottom-10 text-4xl rounded-full p-2 h-auto"
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
