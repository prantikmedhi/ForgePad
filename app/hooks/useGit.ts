export function useGit() {
  return {
    status: async () => ({ files: [] as string[] })
  };
}
