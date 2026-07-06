import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { amount } = await request.json();

    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_KEY_ID, 
      key_secret: process.env.NEXT_PUBLIC_KEY_SECRET || process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: amount * 100, // amount in the smallest currency unit (i.e. ₹100.00 = 10000 paise)
      currency: 'INR',
      receipt: 'receipt_' + crypto.randomBytes(16).toString('hex'), // optional: reference to your DB order ID
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}
