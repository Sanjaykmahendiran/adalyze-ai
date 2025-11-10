import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const INITIATE_PAYMENT_API_URL = process.env.INITIATE_PAYMENT_API_URL || 'https://adalyzeai.xyz/App/razorpay.php';

// POST - Initiate payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await axios.post(INITIATE_PAYMENT_API_URL, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data, { status: 200 });
    
  } catch (error: any) {
    console.error('Initiate payment API Error:', error.message);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: error.response?.data?.message || 'Failed to initiate payment',
        ...(error.response?.data || {})
      },
      { status: error.response?.status || 500 }
    );
  }
}

