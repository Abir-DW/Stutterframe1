// Centralized API Fetcher with environment-injected or custom Gemini API Key
export function getStoredApiKey(): string {
  try {
    const custom = localStorage.getItem('stutterframe-gemini-api-key');
    if (custom && custom.trim()) {
      return custom.trim();
    }
  } catch {
    // ignore localStorage error
  }
  return (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY || '';
}

export function setStoredApiKey(key: string): void {
  try {
    if (!key || !key.trim()) {
      localStorage.removeItem('stutterframe-gemini-api-key');
    } else {
      localStorage.setItem('stutterframe-gemini-api-key', key.trim());
    }
  } catch (e) {
    console.warn('Could not save API key to localStorage', e);
  }
}

export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const key = getStoredApiKey();
  const headers = new Headers(init?.headers || {});
  
  if (key && !headers.has('x-gemini-api-key')) {
    headers.set('x-gemini-api-key', key);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
