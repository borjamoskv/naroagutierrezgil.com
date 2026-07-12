import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const res = await fetch('https://naroagutierrez.wordpress.com/feed/');
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch feed' }, { status: res.status });
    }
    const xml = await res.text();
    
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(xml)) !== null && items.length < 3) {
      const itemXml = match[1];
      
      const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || itemXml.match(/<title>([\s\S]*?)<\/title>/);
      const title = titleMatch ? (titleMatch[1] || titleMatch[2]) : 'Entrada sin título';
      
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
      const link = linkMatch ? linkMatch[1] : '#';
      
      const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const pubDateRaw = dateMatch ? dateMatch[1] : '';
      const pubDate = pubDateRaw ? new Date(pubDateRaw).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
      
      const imgMatch = itemXml.match(/media:content[^>]+url="([^"]+)"/);
      let image = imgMatch ? imgMatch[1] : '/assets/amy-new.webp';
      
      items.push({ title: title.trim(), link: link.trim(), pubDate, image });
    }
    
    return NextResponse.json({ items });
  } catch (error) {
    console.error('API /api/wp error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
