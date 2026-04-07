import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebaseAdmin';
import { ENTRY_VPA } from '@/lib/constants';
import { sendTelegramMessage } from '@/lib/telegram';

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
      createdAt: FieldValue.serverTimestamp(),
    });

    try {
      await sendTelegramMessage(
        `<b>Entry payment — QR opened</b>\nUser: <code>${userId}</code>\nAmount: <b>₹${amt.toFixed(2)}</b>\nVPA: <code>${ENTRY_VPA}</code>\n\nApprove after you verify payment in your UPI app.`,
        {
          inline_keyboard: [
            [
              { text: 'Approve', callback_data: `eap:${token}` },
              { text: 'Deny', callback_data: `edn:${token}` },
            ],
          ],
        }
      );
    } catch (tgErr) {
      console.error('pay-started telegram notify failed', tgErr);
    }

    return NextResponse.json({ ok: true, token });
  } catch (error) {
    console.error('pay-started error', error);
    return NextResponse.json({ error: 'Failed to notify admin' }, { status: 500 });
  }
}
