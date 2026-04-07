import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebaseAdmin';
import { WITHDRAW_FEE, WITHDRAW_MIN } from '@/lib/constants';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const { userId, amount, upiId } = await req.json();
    if (!userId || !amount || !upiId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (Number(amount) < WITHDRAW_MIN) {
      return NextResponse.json({ error: `Minimum withdrawal is ${WITHDRAW_MIN}` }, { status: 400 });
    }

    const userRef = adminDb.collection('users').doc(userId);
    const userSnap = await userRef.get();
    const balance = Number(userSnap.data()?.walletBalance ?? 0);
    if (balance < Number(amount)) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }

    const netAmount = Number(amount) - WITHDRAW_FEE;
    const withdrawalRef = adminDb.collection('withdrawals').doc();
    const txRef = adminDb.collection('transactions').doc();
    const batch = adminDb.batch();
    batch.set(
      userRef,
      { walletBalance: FieldValue.increment(-Number(amount)) },
      { merge: true }
    );
    batch.set(withdrawalRef, {
      userId,
      amount: Number(amount),
      fee: WITHDRAW_FEE,
      netAmount,
      upiId,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
    });
    batch.set(txRef, {
      userId,
      type: 'withdrawal_request',
      amount: -Number(amount),
      linkedWithdrawalId: withdrawalRef.id,
      createdAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();

    await sendTelegramMessage(
      `<b>Withdrawal Request</b>\nUser: <code>${userId}</code>\nRequested: ₹${Number(amount).toFixed(
        2
      )}\nService Charge: ₹${WITHDRAW_FEE.toFixed(2)}\nNet: ₹${netAmount.toFixed(
        2
      )}\nUPI: <code>${upiId}</code>`,
      {
        inline_keyboard: [
          [{ text: 'Audit', callback_data: `audit:${userId}:${withdrawalRef.id}` }],
        ],
      }
    );

    return NextResponse.json({ success: true, netAmount });
  } catch (error) {
    console.error('withdraw request error', error);
    return NextResponse.json({ error: 'Failed to request withdrawal' }, { status: 500 });
  }
}
