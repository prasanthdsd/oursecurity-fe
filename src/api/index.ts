// The single entry point for talking to the backend. Screens import `api` from here only.
import { config } from '../config';
import { httpApi, setAuthToken as setHttpToken } from './http';
import { mockApi, setMockToken } from './mock';

export const api = config.demoMode ? mockApi : httpApi;

export function setAuthToken(token: string | null) {
  setHttpToken(token);
  setMockToken(token);
}

export { ApiError } from './http';
export * from './types';
