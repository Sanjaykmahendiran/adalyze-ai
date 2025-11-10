import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const VIDEO_UPLOAD_API_URL = process.env.VIDEO_UPLOAD_API_URL || 'https://adalyzeai.xyz/App/vidadupl.php';

// POST - Video File Upload
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Forward the FormData to the backend
    const response = await axios.post(VIDEO_UPLOAD_API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return NextResponse.json(response.data, { status: 200 });
    
  } catch (error: any) {
    console.error('Video Upload API Error:', error.message);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: error.response?.data?.message || 'Failed to upload video' 
      },
      { status: error.response?.status || 500 }
    );
  }
}

