"use client";

import { useSectionInView } from "@/lib/hooks";
import { motion } from "framer-motion";
import React, { useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import SectionHeading from "./section-heading";
import SubmitBtn from "./submit-btn";

const Contact = () => {
  const { ref } = useSectionInView("Contact");
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to send email");
        return;
      }

      toast.success("Email sent successfully! I'll get back to you soon.");
      if (formRef.current !== null) {
        formRef.current.reset();
      }
    } catch (err) {
      toast.error("Failed to send email");
    } finally {
      setPending(false);
    }
  }

  return (
    <motion.section
      ref={ref}
      id="contact"
      className="mb-20 sm:mb-28 w-[min(100%,38rem)] text-center"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      <SectionHeading> Contact Me </SectionHeading>
      <p className="text-gray-700 -mt-6 dark:text-white/80">
        Please contact me directly at{" "}
        <a className="underline" href="mailto:a.rubio1224@gmail.com">
          a.rubio1224@gmail.com
        </a>{" "}
        or through this form.
      </p>

      <form
        className="mt-10 grid gap-4 text-left"
        ref={formRef}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-2">
          <Label htmlFor="senderEmail">Your email</Label>
          <Input
            id="senderEmail"
            name="senderEmail"
            type="email"
            placeholder="name@example.com"
            required
            maxLength={500}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="message">Your message</Label>
          <Textarea
            id="message"
            name="message"
            placeholder="How can I help?"
            required
            maxLength={5000}
            className="min-h-52"
          />
        </div>
        <div className="pt-2">
          <SubmitBtn pending={pending} />
        </div>
      </form>
    </motion.section>
  );
};

export default Contact;
