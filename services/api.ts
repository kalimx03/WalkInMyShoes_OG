/**
 * AWS API Gateway / Lambda Backend Service
 * Persists sessions & audit reports to DynamoDB
 */

import { getAccessToken } from './auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function request<T>(endpoint: string, method = 'GET', body?: any): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

/** Save empathy stats to DynamoDB */
export const saveSession = async (userId: string, stats: any): Promise<void> => {
  if (!isBackendConfigured()) return;
  try {
    await request('/sessions', 'POST', {
      userId,
      stats,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('[API] Session save failed (offline):', e);
  }
};

/** Save AR audit report to DynamoDB */
export const saveAuditReport = async (userId: string, report: any): Promise<void> => {
  if (!isBackendConfigured()) return;
  try {
    await request('/audits', 'POST', {
      userId,
      report,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('[API] Audit save failed:', e);
  }
};

/** Get all sessions for a user */
export const getSessions = async (userId: string): Promise<any[]> => {
  if (!isBackendConfigured()) return [];
  try {
    const data = await request<{ sessions: any[] }>(`/sessions/${userId}`);
    return data.sessions || [];
  } catch {
    return [];
  }
};

export const isBackendConfigured = (): boolean =>
  Boolean(API_BASE && !API_BASE.includes('your-api-id'));
