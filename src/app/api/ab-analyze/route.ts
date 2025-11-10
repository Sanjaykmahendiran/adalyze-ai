import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const AB_ANALYZE_API_URL = process.env.AB_ANALYZE_API_URL || 'https://adalyzeai.xyz/App/abanalyze.php';

// POST - A/B Test Analysis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await axios.post(AB_ANALYZE_API_URL, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data, { status: 200 });
    
  } catch (error: any) {
    console.error('A/B Analyze API Error:', error.message);
    
    return NextResponse.json(
      { 
        status: 'error',
        success: false,
        message: error.response?.data?.message || 'Failed to analyze A/B ads',
        ...(error.response?.data || {})
      },
      { status: error.response?.status || 500 }
    );
  }
}

