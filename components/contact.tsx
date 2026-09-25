"use client";

import { profile } from "@/lib/data";
import React, { useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import AppWindow from "./app-window";
import SubmitBtn from "./submit-btn";

const Contact = () => {
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
    <AppWindow
      id="contact"
      section="Contact"
      title="contact.sh"
      index="06"
      heading="Let's talk"
    >
      <p className="-mt-4 text-lg text-foreground/75">
        Email me at{" "}
        <a
          className="font-medium underline decoration-primary underline-offset-4"
          href={`mailto:${profile.email}`}
        >
          {profile.email}
        </a>{" "}
        or use the form. I usually reply within a day.
      </p>

      <form
        className="mt-8 grid max-w-2xl gap-4 text-left"
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
    </AppWindow>
  );
};

export default Contact;
