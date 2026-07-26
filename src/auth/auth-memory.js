let accessToken = null;

export const authMemory = {
  clear: () => {
    accessToken = null;
  },
  get: () => accessToken,
  set: (token) => {
    accessToken = token || null;
  }
};
