import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, imageUrl, link, boardId, accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId is required' },
        { status: 400 }
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'imageUrl is required to create a Pin' },
        { status: 400 }
      );
    }

    // Authenticate the current user
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          cookie: allCookies.map(c => `${c.name}=${c.value}`).join('; '),
        },
      },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Look up the social account by ID, ensuring it belongs to the current user
    const { data: account, error: accountError } = await supabaseAdmin
      .from('social_accounts')
      .select('id, access_token, platform_user_id, platform, display_name')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .eq('platform', 'pinterest')
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Pinterest account not found or access denied' },
        { status: 404 }
      );
    }

    // Resolve board ID — use provided or fetch user's first board
    let resolvedBoardId = boardId;

    if (!resolvedBoardId) {
      const boardsRes = await fetch('https://api.pinterest.com/v5/boards', {
        headers: {
          'Authorization': `Bearer ${account.access_token}`,
        },
      });

      const boardsData = await boardsRes.json();

      if (boardsData.code || !boardsData.items?.length) {
        console.error('Pinterest boards error:', boardsData);
        return NextResponse.json(
          { error: 'No Pinterest boards found. Please create a board first.' },
          { status: 400 }
        );
      }

      resolvedBoardId = boardsData.items[0].id;
    }

    // Create Pin via Pinterest API v5
    const pinBody: Record<string, unknown> = {
      board_id: resolvedBoardId,
      media_source: {
        source_type: 'image_url',
        url: imageUrl,
      },
    };

    if (title) pinBody.title = title;
    if (description) pinBody.description = description;
    if (link) pinBody.link = link;

    const pinRes = await fetch('https://api.pinterest.com/v5/pins', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pinBody),
    });

    const pinData = await pinRes.json();

    if (pinData.code || pinData.message) {
      console.error('Pinterest pin create error:', pinData);
      return NextResponse.json(
        { error: pinData.message || 'Failed to create Pin' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      pinId: pinData.id,
      displayName: account.display_name,
    });
  } catch (error) {
    console.error('Pinterest post route error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating Pin' },
      { status: 500 }
    );
  }
}
