export class ApiError extends Error {
  constructor({
    code = 'REQUEST_FAILED',
    message = 'Something went wrong.',
    details,
    status,
    service
  }) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.status = status;
    this.service = service;
  }
}

export const normalizeApiError = (error, service) => {
  if (error instanceof ApiError) return error;
  const response = error?.response;
  const data = response?.data;
  if (!response) {
    return new ApiError({
      code: error?.code === 'ECONNABORTED' ? 'TIMEOUT' : 'NETWORK_UNAVAILABLE',
      message: 'The service is currently unavailable. Please try again shortly.',
      service
    });
  }
  return new ApiError({
    code: data?.error?.code || data?.code || `HTTP_${response.status}`,
    message: data?.error?.message || data?.message || safeMessage(response.status),
    details: data?.error?.details || data?.details,
    status: response.status,
    service
  });
};

const safeMessage = (status) => {
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to do that.';
  if (status === 404) return 'The requested item could not be found.';
  if (status === 409) return 'This action conflicts with the current information.';
  if (status === 429) return 'Too many requests. Please wait and try again.';
  return 'The service could not complete this request.';
};
