/**
 * AWS Cognito Authentication Service
 * Uses Hosted UI + Authorization Code flow (no amplify dependency)
 */

const COGNITO_DOMAIN  = import.meta.env.VITE_COGNITO_DOMAIN  || '';
const CLIENT_ID       = import.meta.env.VITE_COGNITO_CLIENT_ID || '';
const REGION          = import.meta.env.VITE_COGNITO_REGION   || 'us-east-1';
const REDIRECT_URI    = window.location.origin;

export interface CognitoUser {
  sub: string;
  email: string;
  name?: string;
  given_name?: string;
}

/** Redirect to Cognito Hosted UI login */
export const signIn = () => {
  if (!isCognitoConfigured()) {
    alert('AWS Cognito is not configured yet.\nAdd VITE_COGNITO_DOMAIN and VITE_COGNITO_CLIENT_ID to your .env file.');
    return;
  }
  const url = `https://${COGNITO_DOMAIN}/login?client_id=${CLIENT_ID}&response_type=code&scope=email+openid+profile&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  window.location.href = url;
};

/** Redirect to Cognito Hosted UI signup */
export const signUp = () => {
  if (!isCognitoConfigured()) return;
  const url = `https://${COGNITO_DOMAIN}/signup?client_id=${CLIENT_ID}&response_type=code&scope=email+openid+profile&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  window.location.href = url;
};

/** Sign out and redirect */
export const signOut = () => {
  localStorage.removeItem('wims_access_token');
  localStorage.removeItem('wims_id_token');
  localStorage.removeItem('wims_user');

  if (isCognitoConfigured()) {
    const url = `https://${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(REDIRECT_URI)}`;
    window.location.href = url;
  } else {
    window.location.reload();
  }
};

/** Exchange auth code for tokens — call this on page load when ?code= is present */
export const handleAuthCallback = async (code: string): Promise<CognitoUser | null> => {
  try {
    const body = new URLSearchParams({
      grant_type:   'authorization_code',
      client_id:    CLIENT_ID,
      code,
      redirect_uri: REDIRECT_URI,
    });

    const res = await fetch(`https://${COGNITO_DOMAIN}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!res.ok) return null;

    const tokens = await res.json();
    localStorage.setItem('wims_access_token', tokens.access_token);
    localStorage.setItem('wims_id_token',     tokens.id_token);

    // Decode JWT payload (no verify needed — Cognito is trusted)
    const payload = JSON.parse(atob(tokens.id_token.split('.')[1]));
    const user: CognitoUser = {
      sub:        payload.sub,
      email:      payload.email,
      name:       payload.name || payload.given_name || payload.email?.split('@')[0],
      given_name: payload.given_name,
    };
    localStorage.setItem('wims_user', JSON.stringify(user));
    return user;
  } catch (e) {
    console.error('Cognito callback error:', e);
    return null;
  }
};

/** Get currently logged-in user from localStorage */
export const getCurrentUser = (): CognitoUser | null => {
  try {
    const raw = localStorage.getItem('wims_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/** Get access token for API Gateway calls */
export const getAccessToken = (): string | null =>
  localStorage.getItem('wims_access_token');

/** Check whether Cognito env vars are actually configured */
export const isCognitoConfigured = (): boolean =>
  Boolean(COGNITO_DOMAIN && CLIENT_ID &&
    !COGNITO_DOMAIN.includes('your-domain') &&
    !CLIENT_ID.includes('your_app'));
