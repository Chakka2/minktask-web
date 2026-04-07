import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebaseAdmin';
import { ENTRY_BASE_AMOUNT, ENTRY_VPA } from '@/lib/constants';

function buildAmount(seed: number) {
  return Number((ENTRY_BASE_AMOUNT + seed / 100).toFixed(2));
}

export async function POST(req: NextRequest) {
  try {
    const { userId, referredBy } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const userRef = adminDb.collection('users').doc(userId);
    const intentRef = adminDb.collection('entryIntents').doc(userId);
    const paymentRef = adminDb.collection('payments').doc(userId);

    const [intentSnap, paymentSnap] = await Promise.all([intentRef.get(), paymentRef.get()]);
    let randomPaise = 1;
    if (intentSnap.exists) {
      randomPaise = intentSnap.data()?.randomPaise ?? 1;
    } else {
      randomPaise = Math.floor(Math.random() * 99) + 1;
      await intentRef.set({
        userId,
        randomPaise,
        expectedAmount: buildAmount(randomPaise),
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    const expectedAmount = buildAmount(randomPaise);
    const isConfirmed = paymentSnap.exists && paymentSnap.data()?.status === 'confirmed';

    await userRef.set(
      {
        userId,
        referredBy: referredBy || null,
        isLocked: !isConfirmed,
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({
      userId,
      expectedAmount,
      vpa: ENTRY_VPA,
      isLocked: !isConfirmed,
    });
  } catch (error) {
    console.error('entry init error', error);
    return NextResponse.json({ error: 'Failed to initialize entry payment' }, { status: 500 });
  }
}
