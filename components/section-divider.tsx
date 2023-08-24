"use client";

import { motion } from "framer-motion";
import React from "react";

const SectionDivider = () => {
  return (
    <motion.div
      className="bg-lightMode-accent/20 my-28 h-16 w-1 rounded-full hidden sm:block dark:bg-opacity-20"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.125 }}
    />
  );
};

export default SectionDivider;
