import React from "react";

type SectionHeadingProps = {
  children: React.ReactNode;
};

const SectionHeading = ({ children }: SectionHeadingProps) => {
  return (
    <h2 className="text-3xl font-bold uppercase mb-8 text-center tracking-wide">
      {children}
    </h2>
  );
};

export default SectionHeading;
