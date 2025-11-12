import { NextRequest, NextResponse } from 'next/server';

function absoluteUrl(base: string, maybeRelative: string): string {
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return maybeRelative;
  }
}

function extractImageFromHtml(html: string, pageUrl: string): string | null {
  // Try og:image
  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
                  html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i);
  if (ogMatch && ogMatch[1]) {
    return absoluteUrl(pageUrl, ogMatch[1]);
  }

  // Try twitter:image
  const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
                  html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i);
  if (twMatch && twMatch[1]) {
    return absoluteUrl(pageUrl, twMatch[1]);
  }

  // First <img src>
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (imgMatch && imgMatch[1]) {
    return absoluteUrl(pageUrl, imgMatch[1]);
  }

  return null;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; UniConnect-Resolver/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      // Avoid following too many redirects
      redirect: 'follow',
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      // If it's directly an image, return it
      if (contentType.startsWith('image/')) {
        return NextResponse.json({ image: url });
      }
      return NextResponse.json({ error: 'URL is not HTML or image' }, { status: 400 });
    }

    const html = await res.text();
    const image = extractImageFromHtml(html, url);
    if (!image) {
      return NextResponse.json({ error: 'No image found' }, { status: 404 });
    }
    return NextResponse.json({ image });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to resolve image' }, { status: 500 });
  }
}



