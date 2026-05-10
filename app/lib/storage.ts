export type LocalKey = "trusted_device";

export const storage = {
  async get(_key: LocalKey) {
    return null;
  },
  async set(_key: LocalKey, _value: string) {
    return;
  }
};
