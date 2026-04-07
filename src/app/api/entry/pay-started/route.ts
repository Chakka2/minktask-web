import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { userId, amount } = await req.json();
    if (!userId || amount == null) {
      return NextResponse.json({ error: 'userId and amount required' }, { status: 400 });
    }

    const amt = Number(amount);
    if (Number.isNaN(amt)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const token = crypto.randomBytes(8).toString('hex');
    await adminDb.collection('entryPayPending').doc(token).set({
      userId,
      amount: amt,
      status: 'pending',
      alertSent: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true, token });
  } catch (error) {
    console.error('pay-started error', error);
    return NextResponse.json({ error: 'Failed to create payment request' }, { status: 500 });
  }
}
