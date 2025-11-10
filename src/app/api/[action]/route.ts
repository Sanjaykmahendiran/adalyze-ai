import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://adalyzeai.xyz/App/api.php';

/**
 * Dynamic API Route - No 'gofor' or 'action' visible in URL
 * Frontend usage: /api/userget?user_id=123
 * Network tab shows: GET /api/userget?user_id=123 (gofor completely hidden)
 * Server maps: 'userget' (path) → gofor=userget (server-side only)
 */

/**
 * GET /api/[action]
 * Example: /api/userget?user_id=123 → backend receives gofor=userget&user_id=123
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    // ✅ Await params (Next.js 15 requirement)
    const { action } = await params;
    
    const searchParams = request.nextUrl.searchParams;
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // ✅ Map path segment to 'gofor' (server-side only, never exposed to browser)
    queryParams.gofor = action; // e.g., 'userget', 'guideslist', etc.

    const response = await axios.get(BACKEND_API_URL, {
      params: queryParams,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data, { status: 200 });
    
  } catch (error: any) {
    const { action } = await params;
    console.error(`API Error (GET /${action}):`, error.message);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: error.response?.data?.message || 'API request failed' 
      },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * POST /api/[action]
 * Example: POST /api/addidentifier → backend receives gofor=addidentifier
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    // ✅ Await params (Next.js 15 requirement)
    const { action } = await params;
    
    const body = await request.json();
    
    // ✅ Add 'gofor' to body (server-side only, never exposed to browser)
    body.gofor = action; // e.g., 'addidentifier', 'feedback', etc.
    
    const response = await axios.post(BACKEND_API_URL, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data, { status: 200 });
    
  } catch (error: any) {
    const { action } = await params;
    console.error(`API Error (POST /${action}):`, error.message);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: error.response?.data?.message || 'API request failed' 
      },
      { status: error.response?.status || 500 }
    );
  }
}

