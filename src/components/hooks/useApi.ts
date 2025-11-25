import { useAuth } from '@clerk/nextjs';
import * as reactQuery from '@tanstack/react-query';
import { useCallback } from 'react';
import { SHARE_TOKEN_HEADER } from '@/lib/constants';
import { type FetchResponse, httpDelete, httpGet, httpPost, httpPut } from '@/lib/fetch';
import { useApp } from '@/store/app';

const selector = (state: { shareToken: { token?: string } }) => state.shareToken;

async function handleResponse(res: FetchResponse): Promise<any> {
  if (res.error) {
    const { message, code } = res?.error?.error || {};
    return Promise.reject(new Error(code || message || 'Unexpectd error.'));
  }
  return Promise.resolve(res.data);
}

function handleError(err: Error | string) {
  return Promise.reject((err as Error)?.message || err || null);
}

export function useApi() {
  const { getToken } = useAuth();
  const shareToken = useApp(selector);

  const getDefaultHeaders = async () => {
    const token = await getToken();
    return {
      ...(token && { authorization: `Bearer ${token}` }),
      [SHARE_TOKEN_HEADER]: shareToken?.token,
    };
  };
  const basePath = process.env.basePath;

  const getUrl = (url: string) => {
    return url.startsWith('http') ? url : `${basePath || ''}/api${url}`;
  };

  const getHeaders = async (headers: any = {}) => {
    const defaultHeaders = await getDefaultHeaders();
    return { ...defaultHeaders, ...headers };
  };

  return {
    get: useCallback(
      async (url: string, params: object = {}, headers: object = {}) => {
        const requestHeaders = await getHeaders(headers);
        return httpGet(getUrl(url), params, requestHeaders).then(handleResponse).catch(handleError);
      },
      [httpGet],
    ),

    post: useCallback(
      async (url: string, params: object = {}, headers: object = {}) => {
        const requestHeaders = await getHeaders(headers);
        return httpPost(getUrl(url), params, requestHeaders)
          .then(handleResponse)
          .catch(handleError);
      },
      [httpPost],
    ),

    put: useCallback(
      async (url: string, params: object = {}, headers: object = {}) => {
        const requestHeaders = await getHeaders(headers);
        return httpPut(getUrl(url), params, requestHeaders).then(handleResponse).catch(handleError);
      },
      [httpPut],
    ),

    del: useCallback(
      async (url: string, params: object = {}, headers: object = {}) => {
        const requestHeaders = await getHeaders(headers);
        return httpDelete(getUrl(url), params, requestHeaders)
          .then(handleResponse)
          .catch(handleError);
      },
      [httpDelete],
    ),
    ...reactQuery,
  };
}
