import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const UPLOAD_API_URL = process.env.UPLOAD_API_URL || 'https://adalyzeai.xyz/App/adupl.php';

// POST - File Upload
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Forward the FormData to the backend
    const response = await axios.post(UPLOAD_API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return NextResponse.json(response.data, { status: 200 });
    
  } catch (error: any) {
    console.error('Upload API Error:', error.message);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: error.response?.data?.message || 'Failed to upload file' 
      },
      { status: error.response?.status || 500 }
    );
  }
}

