import { EmailDeliveryError, type EmailMessage, type EmailTransport } from "@/server/notifications/transport";

/** In-memory email transport for tests. Can be told to fail. */
export class FakeTransport implements EmailTransport {
  readonly name = "fake";
  sent: EmailMessage[] = [];
  failWith: string | null = null;

  async send(message: EmailMessage): Promise<void> {
    if (this.failWith) throw new EmailDeliveryError(this.failWith);
    this.sent.push(message);
  }
}
