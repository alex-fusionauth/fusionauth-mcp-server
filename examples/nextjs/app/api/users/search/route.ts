import { NextRequest, NextResponse } from 'next/server';
import { FusionAuthTools } from '@fusionauth/mcp-tools';

const fusionAuth = new FusionAuthTools({
  apiKey: process.env.FUSIONAUTH_API_KEY || 'bf69486b-4733-4470-a592-f1bfce7af580',
  baseUrl: process.env.FUSIONAUTH_BASE_URL || 'http://localhost:9011',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await fusionAuth.searchUsers(body);
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}