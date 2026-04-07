import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required', isLocked: true }, { status: 400 });
  }

  try {
    const paymentSnap = await adminDb.collection('payments').doc(userId).get();
    const isConfirmed = paymentSnap.exists && paymentSnap.data()?.status === 'confirmed';

    if (isConfirmed) {
      await adminDb.collection('users').doc(userId).set({ isLocked: false }, { merge: true });
    }

    return NextResponse.json({ isLocked: !isConfirmed, payment: paymentSnap.data() ?? null });
  } catch (e) {
    console.error('entry status error', e);
    // Stay locked on failure — client must not treat errors as "unlocked".
    return NextResponse.json(
      { error: 'Status unavailable', isLocked: true },
      { status: 503 }
    );
  }
}
