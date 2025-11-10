import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://adalyzeai.xyz/App/api.php';

/**
 * POST /api/auth/login
 * Handles user login via POST request with credentials in body
 * Network tab will only show: POST /api/auth/login (gofor hidden)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Build backend query parameters - gofor is hardcoded here (not from client)
    const params: any = {
      gofor: 'login', // ✅ This is server-side only, never exposed to browser
    };

    if (body.nouptoken) {
      params.nouptoken = body.nouptoken;
    }
    
    if (body.email && body.password) {
      params.email = body.email;
      params.password = body.password;
    }
    
    if (body.google_token) {
      params.google_token = body.google_token;
    }

    // Make request to the actual backend API (server-side only)
    const response = await axios.get(BACKEND_API_URL, {
      params,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Return the response to the client
    return NextResponse.json(response.data, { status: 200 });
    
  } catch (error: any) {
    console.error('Login API Error:', error.message);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: error.response?.data?.message || 'Failed to login' 
      },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * GET /api/auth/login
 * Handles user login via GET request with credentials in query params
 * Network tab will only show: GET /api/auth/login?email=...&password=... (gofor hidden)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Build backend query parameters - gofor is hardcoded here (not from client)
    const params: any = {
      gofor: 'login', // ✅ This is server-side only, never exposed to browser
    };

    const nouptoken = searchParams.get('nouptoken');
    const email = searchParams.get('email');
    const password = searchParams.get('password');
    const google_token = searchParams.get('google_token');

    if (nouptoken) params.nouptoken = nouptoken;
    if (email && password) {
      params.email = email;
      params.password = password;
    }
    if (google_token) params.google_token = google_token;

    // Make request to the actual backend API (server-side only)
    const response = await axios.get(BACKEND_API_URL, {
      params,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data, { status: 200 });
    
  } catch (error: any) {
    console.error('Login API Error:', error.message);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: error.response?.data?.message || 'Failed to login' 
      },
      { status: error.response?.status || 500 }
    );
  }
}

