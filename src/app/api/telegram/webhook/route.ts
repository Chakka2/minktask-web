import { NextRequest, NextResponse } from 'next/server';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebaseAdmin';
import { answerCallbackQuery, editTelegramMessage, sendTelegramMessage } from '@/lib/telegram';

async function countNewJoinsToday() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const snap = await adminDb
    .collection('users')
    .where('createdAt', '>=', Timestamp.fromDate(start))
    .get();
  return snap.size;
}

async function totalRevenue() {
  const payments = await adminDb.collection('payments').where('status', '==', 'confirmed').get();
  const sales = await adminDb.collection('reelSales').get();
  const entryRevenue = payments.docs.reduce((sum, doc) => sum + Number(doc.data().amount ?? 0), 0);
  const reelRevenue = sales.docs.reduce((sum, doc) => sum + Number(doc.data().price ?? 0), 0);
  return { entryRevenue, reelRevenue, total: entryRevenue + reelRevenue };
}

async function handleAudit(callbackData: string, callbackId: string) {
  const [, userId] = callbackData.split(':');
  const [userSnap, txSnap] = await Promise.all([
    adminDb.collection('users').doc(userId).get(),
    adminDb.collection('transactions').where('userId', '==', userId).get(),
  ]);
  const wallet = Number(userSnap.data()?.walletBalance ?? 0);
  const computed = txSnap.docs.reduce((sum, doc) => sum + Number(doc.data().amount ?? 0), 0);
  const result = Math.abs(wallet - computed) < 0.0001 ? 'PASS' : 'MISMATCH';
  await answerCallbackQuery(callbackId, `Audit ${result}`);
  await sendTelegramMessage(
    `<b>Audit ${result}</b>\nUser: <code>${userId}</code>\nWallet: ₹${wallet.toFixed(
      2
    )}\nLedger: ₹${computed.toFixed(2)}`
  );
}

async function handleEntryApprove(token: string, callbackId: string, chatId: string, messageId: number) {
  const ref = adminDb.collection('entryPayPending').doc(token);
  const snap = await ref.get();
  if (!snap.exists) {
    await answerCallbackQuery(callbackId, 'Request expired or invalid');
    return;
  }
  const data = snap.data()!;
  if (data.status !== 'pending') {
    await answerCallbackQuery(callbackId, 'Already handled');
    return;
  }
  const userId = data.userId as string;
  const amount = Number(data.amount);
  await ref.update({ status: 'approved', decidedAt: FieldValue.serverTimestamp() });
  await adminDb.collection('payments').doc(userId).set({
    userId,
    amount,
    status: 'confirmed',
    confirmedAt: FieldValue.serverTimestamp(),
    source: 'admin_telegram',
  });
  await adminDb.collection('users').doc(userId).set({ isLocked: false }, { merge: true });
  await answerCallbackQuery(callbackId, 'Approved');
  await editTelegramMessage(
    chatId,
    messageId,
    `<b>Entry payment — APPROVED</b>\nUser: <code>${userId}</code>\nAmount: ₹${amount.toFixed(2)}`
  );
}

async function handleEntryDeny(token: string, callbackId: string, chatId: string, messageId: number) {
  const ref = adminDb.collection('entryPayPending').doc(token);
  const snap = await ref.get();
  if (!snap.exists) {
    await answerCallbackQuery(callbackId, 'Request expired or invalid');
    return;
  }
  const data = snap.data()!;
  if (data.status !== 'pending') {
    await answerCallbackQuery(callbackId, 'Already handled');
    return;
  }
  const userId = data.userId as string;
  await ref.update({ status: 'denied', decidedAt: FieldValue.serverTimestamp() });
  await answerCallbackQuery(callbackId, 'Denied');
  await editTelegramMessage(
    chatId,
    messageId,
    `<b>Entry payment — DENIED</b>\nUser: <code>${userId}</code>\nAmount: ₹${Number(data.amount).toFixed(2)}`
  );
}

async function handleAdminReply(text: string, replySourceText: string | undefined) {
  const match = replySourceText?.match(/\[support:(.+?)\]/);
  if (!match) return;
  const userId = match[1];
  await adminDb.collection('supportThreads').doc(userId).collection('messages').add({
    userId,
    sender: 'admin',
    message: text,
    createdAt: Timestamp.now(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    if (update.callback_query?.data) {
      const data = String(update.callback_query.data);
      const cq = update.callback_query;
      const chatId = String(cq.message?.chat?.id ?? '');
      const messageId = Number(cq.message?.message_id);

      if (data.startsWith('audit:')) {
        await handleAudit(data, cq.id);
      } else if (data.startsWith('eap:')) {
        const token = data.slice(4);
        await handleEntryApprove(token, cq.id, chatId, messageId);
      } else if (data.startsWith('edn:')) {
        const token = data.slice(4);
        await handleEntryDeny(token, cq.id, chatId, messageId);
      }
      return NextResponse.json({ ok: true });
    }

    const text = update.message?.text as string | undefined;
    if (!text) return NextResponse.json({ ok: true });

    if (text.trim() === '/stats') {
      const [usersSnap, todayJoins, revenue] = await Promise.all([
        adminDb.collection('users').get(),
        countNewJoinsToday(),
        totalRevenue(),
      ]);
      await sendTelegramMessage(
        `<b>EarnHub Stats</b>\nTotal Users: ${usersSnap.size}\nNew Joins Today: ${todayJoins}\nEntry Revenue: ₹${revenue.entryRevenue.toFixed(
          2
        )}\nReel Sales Revenue: ₹${revenue.reelRevenue.toFixed(2)}\nTotal Revenue: ₹${revenue.total.toFixed(2)}`
      );
      return NextResponse.json({ ok: true });
    }

    const replyText = update.message?.reply_to_message?.text as string | undefined;
    if (replyText) {
      await handleAdminReply(text, replyText);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('telegram webhook error', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
