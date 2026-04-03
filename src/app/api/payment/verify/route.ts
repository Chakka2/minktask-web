import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json({ error: 'Razorpay credentials not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, referralCode } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment verification fields' }, { status: 400 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 });
    }

    // Payment verified successfully
    // Backend: mark user as isPaid=true in your database
    // Backend: if referralCode is present, credit ₹20 to the referral code owner's wallet
    // Backend: credit ₹2 to Level 2 referrer, ₹1 to Level 3 referrer
    console.log('Payment verified:', {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      referralCode: referralCode || 'none',
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified. Account activated.',
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
