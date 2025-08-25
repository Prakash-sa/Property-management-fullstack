import AxiosMockAdapter from 'axios-mock-adapter';
import { api } from '../services/api';
import { PROPERTIES, filterProps } from './data';
import { MockEventSource } from './mockEventSource';

export async function setupMocks() {
  const mock = new AxiosMockAdapter(api, { delayResponse: 400, onNoMatch: 'passthrough' });

  // Auth
  mock.onPost('/login').reply(200, { token: 'mock-jwt-token' });

  // Properties (supports full list or offset/limit + status)
  mock.onGet('/properties').reply((config) => {
    const params = (config.params || {}) as any;
    const status = (params.status || 'all') as 'all' | 'available' | 'pending' | 'sold';
    const list = filterProps(status);

    const hasOffset = params.offset !== undefined || params.limit !== undefined;
    if (hasOffset) {
      const offset = Number(params.offset ?? 0);
      const limit = Number(params.limit ?? 30);
      const chunk = list.slice(offset, offset + limit);
      return [200, chunk];
    }
    return [200, list];
  });

  // Replace EventSource globally
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.EventSource = MockEventSource as any;
  }
}
