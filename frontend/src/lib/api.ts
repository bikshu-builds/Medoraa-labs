export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const getApiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
