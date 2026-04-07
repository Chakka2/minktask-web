import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebaseAdmin';
import { ENTRY_BASE_AMOUNT, ENTRY_VPA } from '@/lib/constants';

function buildAmount(seed: number) {
  return Number((ENTRY_BASE_AMOUNT + seed / 100).toFixed(2));
}

export async function POST(req: NextRequest) {
  try {
    const { userId, referredBy, referralCode } = await req.json();
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

    const userSnap = await userRef.get();
    const existingRef = userSnap.data()?.referredBy ?? null;
    let resolvedRef: string | null = null;
    if (typeof referredBy === 'string' && referredBy.trim()) {
      const incoming = referredBy.trim();
      if (incoming === userId) {
        resolvedRef = null;
      } else if (/^\d{7}$/.test(incoming)) {
        const refSnap = await adminDb
          .collection('users')
          .where('referralCode', '==', incoming)
          .limit(1)
          .get();
        resolvedRef = refSnap.empty ? null : String(refSnap.docs[0].id);
      } else {
        resolvedRef = incoming;
      }
    }
    const nextRef = existingRef || resolvedRef;

    await userRef.set(
      {
        userId,
        referredBy: nextRef,
        referralCode:
          typeof referralCode === 'string' && /^\d{7}$/.test(referralCode)
            ? referralCode
            : userSnap.data()?.referralCode ?? null,
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
