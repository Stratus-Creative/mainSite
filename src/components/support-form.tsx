"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SupportForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-lg">Request received!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            We&apos;ll review your request and get back to you within 24–48
            business hours.
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
            const data = new FormData(e.currentTarget);
            fetch("/api/support", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(Object.fromEntries(data)),
            }).then(() => setSubmitted(true));
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                Name
              </label>
              <Input id="name" name="name" placeholder="Your name" required />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="websiteUrl" className="mb-1.5 block text-sm font-medium">
              Your Website URL
            </label>
            <Input
              id="websiteUrl"
              name="websiteUrl"
              type="url"
              placeholder="https://yoursite.com"
              required
            />
          </div>

          <div>
            <label htmlFor="requestType" className="mb-1.5 block text-sm font-medium">
              Request Type
            </label>
            <select
              id="requestType"
              name="requestType"
              required
              defaultValue=""
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="" disabled>
                Select a request type
              </option>
              <option value="bug-fix">Bug Fix</option>
              <option value="content-update">Content Update</option>
              <option value="feature-request">Feature Request</option>
              <option value="billing-question">Billing Question</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your request in as much detail as possible..."
              rows={5}
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            Submit Request
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            We respond within 24–48 business hours.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
