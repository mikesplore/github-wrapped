
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

const formSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .regex(
      /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i,
      "Invalid GitHub username"
    ),
  year: z.coerce.number().int().min(2008).max(new Date().getFullYear()),
});

export async function generateReport(formData: FormData) {
  const parsed = formSchema.safeParse({
    username: formData.get("username"),
    year: formData.get("year"),
  });

  if (!parsed.success) {
    // In a real app, you'd redirect back with an error.
    // For now, we redirect to a generic error page or the home page.
    const firstError = parsed.error.flatten().fieldErrors;
    const errorMessage =
      Object.values(firstError)[0]?.[0] || "Invalid input.";
    // A more robust solution would involve toasts or query params.
    console.error(errorMessage);
    redirect(`/?error=${encodeURIComponent(errorMessage)}`);
  }

  const { username, year } = parsed.data;
  redirect(`/roast/${username}/${year}`);
}
