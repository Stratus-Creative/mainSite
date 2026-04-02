"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-lg">
            Thanks for reaching out!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            We&apos;ll review your info and get back to you within 24 hours.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const data = new FormData(form);

            // Send to API route
            fetch("/api/contact", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(Object.fromEntries(data)),
            }).then(() => setSubmitted(true));
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="businessName"
                className="mb-1.5 block text-sm font-medium"
              >
                Business Name
              </label>
              <Input
                id="businessName"
                name="businessName"
                placeholder="Mike's Plumbing"
                required
              />
            </div>
            <div>
              <label
                htmlFor="ownerName"
                className="mb-1.5 block text-sm font-medium"
              >
                Your Name
              </label>
              <Input
                id="ownerName"
                name="ownerName"
                placeholder="Mike Johnson"
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="phone"
                className="mb-1.5 block text-sm font-medium"
              >
                Phone
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(555) 123-4567"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="mike@example.com"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="mb-1.5 block text-sm font-medium"
              >
                Business Type
              </label>
              <Input
                id="category"
                name="category"
                placeholder="Plumber, Electrician, etc."
                required
              />
            </div>
            <div>
              <label
                htmlFor="city"
                className="mb-1.5 block text-sm font-medium"
              >
                City
              </label>
              <Input
                id="city"
                name="city"
                placeholder="Austin, TX"
                required
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="message"
              className="mb-1.5 block text-sm font-medium"
            >
              Tell us about your business
            </label>
            <Textarea
              id="message"
              name="message"
              placeholder="What services do you offer? How long have you been in business?"
              rows={4}
            />
          </div>
          <Button type="submit" className="w-full" size="lg">
            Get My Website
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            No obligation. We&apos;ll reach out within 24 hours.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
