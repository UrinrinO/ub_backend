import { Request, Response } from "express";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "";
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? "contact@urinrin.com";

export async function sendContactMessage(req: Request, res: Response) {
  const { name, email, message } = req.body ?? {};

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "Name, email and message are required." });
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  if (!TO_EMAIL) {
    console.error("CONTACT_TO_EMAIL env var is not set.");
    return res.status(500).json({ error: "Server misconfiguration." });
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `New message from ${name} — urinrin.com`,
      html: `
        <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 32px; background: #f5f4f0; border-radius: 12px;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin: 0 0 24px;">
            New contact form submission · urinrin.com
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #ddd; color: #888; font-size: 12px; width: 80px; text-transform: uppercase; letter-spacing: 0.05em;">Name</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #ddd; color: #0f172a; font-size: 14px;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #ddd; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Email</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">
                <a href="mailto:${escapeHtml(email)}" style="color: #0f172a; font-size: 14px;">${escapeHtml(email)}</a>
              </td>
            </tr>
          </table>

          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin: 0 0 12px;">Message</p>
          <div style="background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; font-size: 14px; color: #0f172a; line-height: 1.7; white-space: pre-wrap;">
${escapeHtml(message)}
          </div>

          <p style="margin-top: 32px; font-size: 11px; color: #bbb;">
            Reply directly to this email to respond to ${escapeHtml(name)}.
          </p>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("Resend error:", err);
    return res.status(500).json({ error: "Failed to send message. Please try again." });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
