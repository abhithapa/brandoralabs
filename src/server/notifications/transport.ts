import "server-only";
import nodemailer from "nodemailer";
import type { Env } from "@/config/env";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  /** Stable per outbox row; sent as Message-ID so retries are recognisable downstream. */
  idempotencyKey: string;
};

/** Error with a short, safe code stored on the outbox row. Never includes recipient data. */
export class EmailDeliveryError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

export interface EmailTransport {
  readonly name: string;
  send(message: EmailMessage): Promise<void>;
}

/** Development only: logs a redacted summary instead of sending. Refused in production by env validation. */
export const logTransport: EmailTransport = {
  name: "log",
  async send(message) {
    const [user, domain] = message.to.split("@");
    console.info(
      JSON.stringify({
        event: "email.log_transport",
        to: `${user?.slice(0, 2) ?? ""}***@${domain ?? ""}`,
        subject: message.subject,
        bytes: message.text.length,
      }),
    );
  },
};

export function createSmtpTransport(env: Env): EmailTransport {
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
  });
  const domain = new URL(env.SITE_URL).hostname;
  return {
    name: "smtp",
    async send(message) {
      try {
        await transporter.sendMail({
          from: env.EMAIL_FROM,
          to: message.to,
          subject: message.subject,
          text: message.text,
          messageId: `<${message.idempotencyKey}@${domain}>`,
        });
      } catch (error) {
        const code =
          typeof error === "object" && error && "code" in error && typeof error.code === "string"
            ? `smtp_${error.code}`.slice(0, 64)
            : "smtp_error";
        throw new EmailDeliveryError(code);
      }
    },
  };
}

export function createTransport(env: Env): EmailTransport {
  return env.EMAIL_TRANSPORT === "smtp" ? createSmtpTransport(env) : logTransport;
}
