export const logger = {
  info(scope: string, message: string, fields?: Record<string, unknown>) {
    console.log(`[${scope}] ${message}`, fields ?? {});
  }
};
