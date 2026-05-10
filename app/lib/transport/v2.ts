import type { Envelope } from "./protocol";

export class MobileTransport {
  async send(message: Envelope): Promise<{ ok: true; echo: Envelope }> {
    return { ok: true, echo: message };
  }
}
