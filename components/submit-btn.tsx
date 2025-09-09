import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import React from "react";

type Props = {
  pending?: boolean;
};

const SubmitBtn: React.FC<Props> = ({ pending = false }) => {
  return (
    <Button
      type="submit"
      // Use shadcn default variant then hard-override bg to avoid transparency issues
      variant="default"
      className="group h-12 w-32 rounded-full text-white bg-gray-900 dark:bg-white/10 hover:bg-[var(--color-primary-hover)] dark:hover:bg-white/15 disabled:opacity-60 active:scale-105 transition-all"
      disabled={pending}
      aria-busy={pending}
      aria-live="polite"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          Sending...
        </>
      ) : (
        <>
          Submit
          <Send
            className="ml-2 h-4 w-4 opacity-80 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </>
      )}
    </Button>
  );
};

export default SubmitBtn;
