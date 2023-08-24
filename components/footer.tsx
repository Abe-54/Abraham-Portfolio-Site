import React from "react";

const Footer = () => {
  return (
    <footer className="mb-10 px-4 text-center text-gray-500">
      <small className="mb-2 block test-xs">
        &copy; 2030 Abraham Rubio. All rights reserved.
      </small>
      <p className="text-xs">
        <span className="font-semibold">About this website:</span>built with
        React & Next.js (App Router & Server Actions), Typescript, Tailwind CSS,
        Framer Motion, React Email & Resend, Netlify Hosting
      </p>
    </footer>
  );
};

export default Footer;
