import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://adalyzeai.xyz/App/api.php';

// POST - Add consent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await axios.post(BACKEND_API_URL, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data, { status: 200 });
    
  } catch (error: any) {
    console.error('Consent API Error:', error.message);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: error.response?.data?.message || 'Failed to process consent' 
      },
      { status: error.response?.status || 500 }
    );
  }
}

// GET - Get consent
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());

    const response = await axios.get(BACKEND_API_URL, {
      params,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data, { status: 200 });
    
  } catch (error: any) {
    console.error('Get Consent API Error:', error.message);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: error.response?.data?.message || 'Failed to get consent' 
      },
      { status: error.response?.status || 500 }
    );
  }
}

