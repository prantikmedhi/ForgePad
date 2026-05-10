import type { ControlRequest } from "./protocol.js";

export class AgentTransport {
  async handle(request: ControlRequest) {
    return {
      ok: true,
      request
    };
  }
}
