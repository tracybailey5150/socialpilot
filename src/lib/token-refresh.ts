import { supabaseAdmin } from '@/lib/supabase/server';

type AccountWithTokens = {
  id: string;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
};

/**
 * Refreshes a YouTube/Google OAuth token if it's expired or about to expire.
 * Updates the token in the database and returns the valid access token.
 */
export async function getValidYouTubeToken(account: AccountWithTokens): Promise<string> {
  if (!account.token_expires_at || !account.refresh_token) {
    return account.access_token;
  }

  const expiresAt = new Date(account.token_expires_at).getTime();
  const now = Date.now();

  // Refresh if token expires within 5 minutes
  if (now < expiresAt - 5 * 60 * 1000) {
    return account.access_token;
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: account.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  const data = await res.json();

  if (data.error) {
    console.error('YouTube token refresh failed:', data.error);
    return account.access_token; // Return existing token as fallback
  }

  const newExpiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

  await supabaseAdmin
    .from('social_accounts')
    .update({
      access_token: data.access_token,
      token_expires_at: newExpiresAt,
    })
    .eq('id', account.id);

  return data.access_token;
}
