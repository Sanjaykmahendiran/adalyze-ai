import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const VERIFY_PAYMENT_API_URL = process.env.VERIFY_PAYMENT_API_URL || 'https://adalyzeai.xyz/App/verify.php';

// POST - Verify payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await axios.post(VERIFY_PAYMENT_API_URL, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data, { status: 200 });
    
  } catch (error: any) {
    console.error('Verify payment API Error:', error.message);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: error.response?.data?.message || 'Failed to verify payment',
        ...(error.response?.data || {})
      },
      { status: error.response?.status || 500 }
    );
  }
}

