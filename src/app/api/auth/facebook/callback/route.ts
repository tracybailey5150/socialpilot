import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const fbError = searchParams.get('error');
  const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  // User denied permissions or Facebook returned an error
  if (fbError) {
    const errorDesc = searchParams.get('error_description') || 'Facebook authorization denied';
    console.error('Facebook OAuth error:', fbError, errorDesc);
    return NextResponse.redirect(
      new URL(`/accounts?error=${encodeURIComponent(errorDesc)}`, origin)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/accounts?error=Missing+authorization+code+or+state', origin)
    );
  }

  // Validate state against cookie
  const cookieStore = await cookies();
  const savedState = cookieStore.get('fb_oauth_state')?.value;

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(
      new URL('/accounts?error=Invalid+state+parameter.+Please+try+again.', origin)
    );
  }

  // Clear the state cookie
  cookieStore.delete('fb_oauth_state');

  try {
    const appId = process.env.FACEBOOK_APP_ID!;
    const appSecret = process.env.FACEBOOK_APP_SECRET!;
    const redirectUri = `${origin}/api/auth/facebook/callback`;

    // Step 1: Exchange code for short-lived user token
    const tokenUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', appId);
    tokenUrl.searchParams.set('client_secret', appSecret);
    tokenUrl.searchParams.set('code', code);
    tokenUrl.searchParams.set('redirect_uri', redirectUri);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error('Facebook token exchange error:', tokenData.error);
      return NextResponse.redirect(
        new URL(`/accounts?error=${encodeURIComponent(tokenData.error.message || 'Token exchange failed')}`, origin)
      );
    }

    const shortLivedToken = tokenData.access_token;

    // Step 2: Exchange for long-lived user token
    const longTokenUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
    longTokenUrl.searchParams.set('grant_type', 'fb_exchange_token');
    longTokenUrl.searchParams.set('client_id', appId);
    longTokenUrl.searchParams.set('client_secret', appSecret);
    longTokenUrl.searchParams.set('fb_exchange_token', shortLivedToken);

    const longTokenRes = await fetch(longTokenUrl.toString());
    const longTokenData = await longTokenRes.json();

    if (longTokenData.error) {
      console.error('Facebook long-lived token error:', longTokenData.error);
      return NextResponse.redirect(
        new URL(`/accounts?error=${encodeURIComponent(longTokenData.error.message || 'Long-lived token exchange failed')}`, origin)
      );
    }

    const longLivedUserToken = longTokenData.access_token;

    // Step 3: Get the current Supabase user from the request cookies
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Create a Supabase client using the user's cookies for auth
    const allCookies = cookieStore.getAll();
    const sbAccessToken = allCookies.find(c => c.name.includes('auth-token'))?.value;

    // Use the anon client to get the user from their session cookies
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          cookie: allCookies.map(c => `${c.name}=${c.value}`).join('; '),
        },
      },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error('Supabase user error:', userError);
      return NextResponse.redirect(
        new URL('/accounts?error=Not+authenticated.+Please+log+in+and+try+again.', origin)
      );
    }

    // Step 4: Get user's Facebook Pages
    const pagesUrl = new URL('https://graph.facebook.com/v21.0/me/accounts');
    pagesUrl.searchParams.set('access_token', longLivedUserToken);
    pagesUrl.searchParams.set('fields', 'id,name,access_token,category,tasks');

    const pagesRes = await fetch(pagesUrl.toString());
    const pagesData = await pagesRes.json();

    if (pagesData.error) {
      console.error('Facebook pages error:', pagesData.error);
      return NextResponse.redirect(
        new URL(`/accounts?error=${encodeURIComponent(pagesData.error.message || 'Failed to retrieve pages')}`, origin)
      );
    }

    const pages = pagesData.data || [];

    if (pages.length === 0) {
      return NextResponse.redirect(
        new URL('/accounts?error=No+Facebook+Pages+found.+Make+sure+you+manage+at+least+one+Page.', origin)
      );
    }

    // Step 5: Save each page to social_accounts using service role client
    for (const page of pages) {
      // Upsert: update if this page already exists for this user, insert otherwise
      const { error: upsertError } = await supabaseAdmin
        .from('social_accounts')
        .upsert(
          {
            user_id: user.id,
            platform: 'facebook',
            platform_user_id: page.id,
            platform_username: page.name,
            display_name: page.name,
            access_token: page.access_token, // Page tokens from long-lived user tokens are already long-lived
            scopes: (page.tasks || []).join(','),
            metadata: { category: page.category },
          },
          {
            onConflict: 'user_id,platform,platform_user_id',
          }
        );

      if (upsertError) {
        console.error('Error saving page:', page.name, upsertError);
        // If upsert with conflict fails, try a simple insert/update approach
        const { data: existing } = await supabaseAdmin
          .from('social_accounts')
          .select('id')
          .eq('user_id', user.id)
          .eq('platform', 'facebook')
          .eq('platform_user_id', page.id)
          .single();

        if (existing) {
          await supabaseAdmin
            .from('social_accounts')
            .update({
              platform_username: page.name,
              display_name: page.name,
              access_token: page.access_token,
              scopes: (page.tasks || []).join(','),
              metadata: { category: page.category },
            })
            .eq('id', existing.id);
        } else {
          await supabaseAdmin
            .from('social_accounts')
            .insert({
              user_id: user.id,
              platform: 'facebook',
              platform_user_id: page.id,
              platform_username: page.name,
              display_name: page.name,
              access_token: page.access_token,
              scopes: (page.tasks || []).join(','),
              metadata: { category: page.category },
            });
        }
      }
    }

    return NextResponse.redirect(new URL('/accounts?connected=facebook', origin));
  } catch (error) {
    console.error('Facebook OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/accounts?error=An+unexpected+error+occurred+during+Facebook+connection.', origin)
    );
  }
}
