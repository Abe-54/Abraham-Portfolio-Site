const Footer = () => {
  return (
    <footer className="mb-32 px-4 text-center text-foreground/50">
      <small className="mb-2 block text-xs">
        &copy; {new Date().getFullYear()} Abraham Rubio
      </small>
      <p className="text-xs">
        Built with Next.js, TypeScript, Tailwind CSS, and Framer Motion. Hosted
        on Vercel.
      </p>
    </footer>
  );
};

export default Footer;
