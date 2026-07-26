let refreshSession = null;
let sessionFailed = () => {};
let refreshPromise = null;

export const configureRefreshQueue = ({ refresh, onSessionFailure }) => {
  refreshSession = refresh;
  sessionFailed = onSessionFailure || (() => {});
};

export const refreshOnce = async () => {
  if (!refreshSession) throw new Error('Refresh handler is unavailable');
  if (!refreshPromise) {
    refreshPromise = refreshSession()
      .catch((error) => {
        sessionFailed();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};
