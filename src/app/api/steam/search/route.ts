import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=english&cc=US`, {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch from Steam Store API');
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Error searching Steam Store:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
