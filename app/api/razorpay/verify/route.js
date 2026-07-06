import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    // Verify the payment signature to ensure it's authentic and not tampered with
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.NEXT_PUBLIC_KEY_SECRET || process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // 🚀 Your logic here: Payment was successful!
      // Update database, grant premium access, send email, etc.
      
      return NextResponse.json({ success: true, message: 'Payment successfully verified!' });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 });
    }
  } catch (error) {
    console.error('Razorpay verification error:', error);
    return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 500 });
  }
}
