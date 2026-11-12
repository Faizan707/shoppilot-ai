import axios from 'axios';

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: unknown } | undefined;
    if (data?.message) return data.message;
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return String(data.errors[0]);
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
