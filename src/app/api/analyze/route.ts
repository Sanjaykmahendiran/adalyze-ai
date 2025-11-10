import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const ANALYZE_API_URL = process.env.ANALYZE_API_URL || 'https://adalyzeai.xyz/App/analyze.php';

// POST - Analyze ad
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await axios.post(ANALYZE_API_URL, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data, { status: 200 });
    
  } catch (error: any) {
    console.error('Analyze API Error:', error.message);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: error.response?.data?.message || 'Failed to analyze ad',
        ...(error.response?.data || {})
      },
      { status: error.response?.status || 500 }
    );
  }
}

