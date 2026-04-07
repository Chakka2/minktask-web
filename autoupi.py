#!/usr/bin/env python3
"""
MinTask Telegram Admin Bot
Requirements: pip install "python-telegram-bot==13.15" firebase-admin
Setup: Place serviceAccountKey.json in same folder. Run: python admin_bot.py
"""
import os, logging, threading
import firebase_admin
from firebase_admin import credentials, db
from telegram import Bot, Update, InlineKeyboardButton, InlineKeyboardMarkup, BotCommand
from telegram.ext import Updater, CommandHandler, CallbackQueryHandler, CallbackContext
from datetime import datetime, timedelta

# ─────────────────────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────────────────────
TELEGRAM_BOT_TOKEN   = "8341310648:AAF8TA3y8H84cjH5WW6JAQwAxidZfTuDb6E"
ADMIN_CHAT_ID        = "1650296765"
FIREBASE_DB_URL      = "https://mintask-b4a83-default-rtdb.firebaseio.com/"
SERVICE_ACCOUNT_FILE = os.environ.get(
    "FIREBASE_SERVICE_ACCOUNT",
    os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")
)
JOINING_BONUS = 40.0

logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
log = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# FIREBASE INIT
# ─────────────────────────────────────────────────────────────────────────────
if not firebase_admin._apps:
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        raise FileNotFoundError(
            "Firebase service account file not found.\n"
            f"Expected at: {SERVICE_ACCOUNT_FILE}\n"
            "Fix:\n"
            "1) Download Firebase Admin SDK JSON from Firebase Console > Project Settings > Service Accounts.\n"
            "2) Save it as serviceAccountKey.json in this folder, OR set env var FIREBASE_SERVICE_ACCOUNT to full file path.\n"
        )
    firebase_admin.initialize_app(
        credentials.Certificate(SERVICE_ACCOUNT_FILE),
        {"databaseURL": FIREBASE_DB_URL}
    )

_bot = Bot(token=TELEGRAM_BOT_TOKEN)

# ─────────────────────────────────────────────────────────────────────────────
# BOT COMMANDS
# ─────────────────────────────────────────────────────────────────────────────
BOT_COMMANDS = [
    BotCommand("start",           "🤖 Help & command list"),
    BotCommand("dashboard",       "📊 Overview — users, revenue, withdrawals"),
    BotCommand("userstats",       "🏆 Top 10 earners"),
    BotCommand("topreferrers",    "🔗 Top 10 referrers"),
    BotCommand("dailystats",      "📅 Last 24h new users & revenue"),
    BotCommand("withdrawals",     "⏳ Pending withdrawal requests"),
    BotCommand("complaints",      "🚨 Open user complaints"),
    BotCommand("activate",        "✅ Activate user — /activate USER_ID"),
    BotCommand("approve_tier",    "👑 Approve tier — /approve_tier USER_ID"),
    BotCommand("verify_payment",  "💳 Verify payment — /verify_payment USER_ID"),
    BotCommand("user",            "👤 User profile — /user USER_ID"),
    BotCommand("update",          "🚀 Push update — /update 1.1 | fixes | https://link"),
    BotCommand("force",           "🚨 Force update — /force 1.1 | fixes | https://link"),
    BotCommand("cancel_update",   "❌ Remove update popup"),
    BotCommand("update_status",   "📋 Check current update info"),
    BotCommand("shutdown_app",    "⚠️ Start 7-day app shutdown"),
    BotCommand("cancel_shutdown", "✅ Cancel shutdown"),
]

# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────
def is_admin(update):
    return str(update.effective_chat.id) == ADMIN_CHAT_ID

def fmt_inr(v):
    try: return f"₹{float(v):.2f}"
    except: return f"₹{v}"

def fmt_ts(t):
    try: return datetime.fromtimestamp(int(t) / 1000).strftime("%d %b %Y, %H:%M")
    except: return str(t)

# ─────────────────────────────────────────────────────────────────────────────
# APPROVE USER  — writes to Firebase, Android app listens and reacts
# ─────────────────────────────────────────────────────────────────────────────
def _approve_user(uid: str) -> bool:
    try:
        # This is what the Android ValueEventListener watches:
        # when status becomes "verified" the app opens automatically for the user
        db.reference(f"qrPaymentSessions/{uid}").update({
            "status": "verified",
            "approvedByAdmin": True,
        })
        db.reference(f"pendingActivations/{uid}").update({"status": "approved"})
        db.reference(f"users/{uid}").update({"isPaid": True})

        # Credit joining bonus (idempotent)
        bonus_ref   = db.reference(f"users/{uid}/joiningBonusPaid")
        balance_ref = db.reference(f"users/{uid}/balance")
        if not bonus_ref.get():
            bonus_ref.set(True)
            current = float(balance_ref.get() or 0.0)
            balance_ref.set(current + JOINING_BONUS)
            db.reference(f"users/{uid}/joiningBonus").set(JOINING_BONUS)

        log.info("APPROVED uid=%s", uid)
        return True
    except Exception as e:
        log.error("approve failed uid=%s: %s", uid, e)
        return False


# ─────────────────────────────────────────────────────────────────────────────
# DENY USER  — writes "denied" to Firebase, Android app shows rejection dialog
# ─────────────────────────────────────────────────────────────────────────────
def _deny_user(uid: str) -> bool:
    try:
        # Android listens to this — when status = "denied" the app shows
        # a rejection dialog to the user
        db.reference(f"qrPaymentSessions/{uid}").update({"status": "denied"})
        db.reference(f"pendingActivations/{uid}").update({"status": "denied"})
        log.info("DENIED uid=%s", uid)
        return True
    except Exception as e:
        log.error("deny failed uid=%s: %s", uid, e)
        return False


# ─────────────────────────────────────────────────────────────────────────────
# SEND PAYMENT ALERT TO ADMIN
# This is called automatically the moment the user taps "Scan & Pay QR"
# The user sees "Payment verifying..." while YOU see Approve/Deny buttons
# ─────────────────────────────────────────────────────────────────────────────
def send_payment_alert(uid: str, session: dict):
    email   = session.get("email",     "unknown")
    amount  = session.get("amount",    "?")
    txn_ref = session.get("txnRef",    "?")
    expires = session.get("expiresAt", 0)

    # This message goes ONLY to you (admin) — user never sees this
    text = (
        f"💰 *New Payment Request*\n\n"
        f"📧 Email: `{email}`\n"
        f"🆔 UID: `{uid}`\n"
        f"💵 *Amount: ₹{amount}*\n"
        f"🔖 TxnRef: `{txn_ref}`\n"
        f"⏱ Expires: {fmt_ts(expires)}\n\n"
        f"Check your UPI app — did you receive ₹{amount}?"
    )

    # These buttons are only visible to you in Telegram
    keyboard = InlineKeyboardMarkup([[
        InlineKeyboardButton("✅  APPROVE", callback_data=f"approve:{uid}"),
        InlineKeyboardButton("❌  DENY",    callback_data=f"deny:{uid}"),
    ]])

    try:
        _bot.send_message(
            chat_id      = ADMIN_CHAT_ID,
            text         = text,
            parse_mode   = "Markdown",
            reply_markup = keyboard,
        )
        log.info("Alert sent to admin — uid=%s amount=₹%s", uid, amount)
    except Exception as e:
        log.error("send_payment_alert failed: %s", e)


# ─────────────────────────────────────────────────────────────────────────────
# SEND WITHDRAWAL ALERT TO ADMIN
# ─────────────────────────────────────────────────────────────────────────────
def send_withdrawal_alert(wid: str, wd: dict):
    try:
        uid      = wd.get("uid", "")
        u        = db.reference(f"users/{uid}").get() or {}
        email    = u.get("email", wd.get("email", "?"))
        bal      = float(u.get("balance", 0))
        earn     = float(u.get("totalEarned", 0))
        refs     = int(u.get("referralCount", 0))
        tier     = u.get("tierPlanActive", False)
        w_amt    = wd.get("amount", 0)
        w_net    = wd.get("netAmount", w_amt)
        w_fee    = wd.get("fee", 0)
        w_upi    = wd.get("upiId", "?")
        prev_wds = u.get("withdrawals", {})
        prev_c   = len(prev_wds) if isinstance(prev_wds, dict) else 0
        prev_p   = sum(
            float(w.get("amount", 0))
            for w in (prev_wds.values() if isinstance(prev_wds, dict) else [])
            if isinstance(w, dict) and w.get("status") in ("PAID", "Completed", "Approved")
        )
        msg = (
            f"💸 *Withdrawal Request*\n\n"
            f"📧 `{email}`\n"
            f"🆔 `{uid}`\n"
            f"👑 {'✅ Tier' if tier else '—'}  |  🔗 Refs: {refs}\n"
            f"💰 Balance: {fmt_inr(bal)}  |  Earned: {fmt_inr(earn)}\n"
            f"📤 Previous: {prev_c} requests, {fmt_inr(prev_p)} paid\n\n"
            f"🏦 *This Request*\n"
            f"Amount: {fmt_inr(w_amt)} | Fee: {fmt_inr(w_fee)} | Net: {fmt_inr(w_net)}\n"
            f"UPI: `{w_upi}`\n"
            f"🕐 {fmt_ts(wd.get('timestamp', 0))}"
        )
        _bot.send_message(
            chat_id      = ADMIN_CHAT_ID,
            text         = msg,
            parse_mode   = "Markdown",
            reply_markup = InlineKeyboardMarkup([
                [InlineKeyboardButton(
                    f"✅ PAID {fmt_inr(w_net)} → {w_upi}",
                    callback_data=f"pay_withdrawal:{uid}:{wid}:{w_net}:{w_upi}"
                )],
                [InlineKeyboardButton(
                    "❌ DENY & Refund",
                    callback_data=f"deny_withdrawal:{uid}:{wid}:{w_amt}"
                )],
            ])
        )
    except Exception as e:
        log.error("send_withdrawal_alert failed: %s", e)


# ─────────────────────────────────────────────────────────────────────────────
# BUTTON HANDLER — fires when YOU tap Approve or Deny in Telegram
# ─────────────────────────────────────────────────────────────────────────────
def handle_button(update: Update, ctx: CallbackContext):
    q = update.callback_query
    q.answer()
    try:
        parts  = q.data.split(":")
        action = parts[0]
        uid    = parts[1]

        # ── You tapped APPROVE ────────────────────────────────────────────────
        if action == "approve":
            if _approve_user(uid):
                u = db.reference(f"users/{uid}").get() or {}
                # Edit the Telegram message to show it's done
                q.edit_message_text(
                    f"✅ *APPROVED*\n\n"
                    f"🆔 `{uid}`\n"
                    f"📧 {u.get('email', '—')}\n\n"
                    f"Account is now active.\n"
                    f"₹{JOINING_BONUS:.0f} joining bonus credited.",
                    parse_mode="Markdown"
                )
            else:
                q.edit_message_text(
                    f"⚠️ Firebase write failed for `{uid}`\nCheck logs.",
                    parse_mode="Markdown"
                )

        # ── You tapped DENY ───────────────────────────────────────────────────
        elif action == "deny":
            if _deny_user(uid):
                u = db.reference(f"users/{uid}").get() or {}
                q.edit_message_text(
                    f"❌ *DENIED*\n\n"
                    f"🆔 `{uid}`\n"
                    f"📧 {u.get('email', '—')}",
                    parse_mode="Markdown"
                )
            else:
                q.edit_message_text(
                    f"⚠️ Firebase write failed for `{uid}`\nCheck logs.",
                    parse_mode="Markdown"
                )

        # ── Withdrawal paid ───────────────────────────────────────────────────
        elif action == "pay_withdrawal":
            wid, amt, upi = parts[2], parts[3], parts[4]
            db.reference(f"withdrawalRequests/{wid}").update({"status": "PAID"})
            wds = db.reference(f"users/{uid}/withdrawals").get() or {}
            for k, w in (wds.items() if isinstance(wds, dict) else []):
                if isinstance(w, dict) and w.get("status") in ("Pending", "PENDING_APPROVAL"):
                    db.reference(f"users/{uid}/withdrawals/{k}").update({"status": "PAID"})
                    cur = float(db.reference(f"users/{uid}/totalWithdrawn").get() or 0)
                    db.reference(f"users/{uid}/totalWithdrawn").set(
                        cur + float(w.get("netAmount", w.get("amount", 0)))
                    )
                    break
            q.edit_message_text(
                f"✅ *Withdrawal Paid*\n\n💵 {fmt_inr(amt)} → `{upi}`\n🆔 `{uid}`",
                parse_mode="Markdown"
            )

        # ── Withdrawal deny & refund ──────────────────────────────────────────
        elif action == "deny_withdrawal":
            wid, amt = parts[2], parts[3]
            cur = float(db.reference(f"users/{uid}/balance").get() or 0)
            db.reference(f"users/{uid}/balance").set(cur + float(amt))
            db.reference(f"withdrawalRequests/{wid}").update({"status": "Rejected"})
            wds = db.reference(f"users/{uid}/withdrawals").get() or {}
            for k, w in (wds.items() if isinstance(wds, dict) else []):
                if isinstance(w, dict) and w.get("status") in ("Pending", "PENDING_APPROVAL"):
                    db.reference(f"users/{uid}/withdrawals/{k}").update({"status": "Rejected"})
                    break
            q.edit_message_text(
                f"❌ *Withdrawal Denied*\n\n💵 {fmt_inr(amt)} refunded to wallet\n🆔 `{uid}`",
                parse_mode="Markdown"
            )

    except Exception as e:
        log.error("handle_button error: %s", e)
        try: q.edit_message_text(f"⚠️ Error: {e}")
        except: pass


# ─────────────────────────────────────────────────────────────────────────────
# FIREBASE LISTENERS — run in background threads
# ─────────────────────────────────────────────────────────────────────────────

_alerted_sessions    = set()
_alerted_withdrawals = set()


def qr_payment_listener(event):
    """
    Watches qrPaymentSessions/ in Firebase.
    The moment Android writes a new session with status='pending'
    (user tapped Scan & Pay QR), this fires and sends YOU the Approve/Deny alert.
    The user sees nothing about this — they just see 'Payment verifying...'
    """
    if event.data is None:
        return
    try:
        if event.path == "/":
            # Initial load — check all existing pending sessions
            if isinstance(event.data, dict):
                for uid, session in event.data.items():
                    if (
                        isinstance(session, dict)
                        and session.get("status") == "pending"
                        and uid not in _alerted_sessions
                    ):
                        _alerted_sessions.add(uid)
                        send_payment_alert(uid, session)
        else:
            path = event.path.strip("/")
            # Only fire on top-level UID writes (new full session object)
            # Skip field-level updates like /UID/status
            if "/" in path:
                return
            uid     = path
            session = event.data
            if (
                isinstance(session, dict)
                and session.get("status") == "pending"
                and uid not in _alerted_sessions
            ):
                _alerted_sessions.add(uid)
                send_payment_alert(uid, session)
    except Exception as e:
        log.error("qr_payment_listener error: %s", e)


def withdrawal_listener(event):
    """
    Watches withdrawalRequests/ and sends YOU the Paid/Deny alert
    when a new withdrawal request comes in.
    """
    if event.data is None:
        return
    try:
        if event.path != "/":
            wid = event.path.strip("/")
            if (
                isinstance(event.data, dict)
                and event.data.get("status") in ("Pending", "PENDING_APPROVAL")
                and wid not in _alerted_withdrawals
            ):
                _alerted_withdrawals.add(wid)
                send_withdrawal_alert(wid, event.data)
    except Exception as e:
        log.error("withdrawal_listener error: %s", e)


# ─────────────────────────────────────────────────────────────────────────────
# COMMANDS
# ─────────────────────────────────────────────────────────────────────────────

def cmd_start(u, c):
    if not is_admin(u): return
    u.message.reply_text(
        "🤖 *MinTask Admin Bot*\n\n"
        "📡 *Auto-alerts running:*\n"
        "• User pays → you get ✅ APPROVE / ❌ DENY buttons\n"
        "• New withdrawal → you get Paid / Deny buttons\n\n"
        "Tap / to see all commands.",
        parse_mode="Markdown"
    )

def cmd_dashboard(u, c):
    if not is_admin(u): return
    users = db.reference("users").get() or {}
    wr    = db.reference("withdrawalRequests").get() or {}
    act   = sum(1 for x in users.values() if isinstance(x, dict) and x.get("isPaid"))
    earn  = sum(float(x.get("totalEarned", 0)) for x in users.values() if isinstance(x, dict))
    wdrn  = sum(float(x.get("totalWithdrawn", 0)) for x in users.values() if isinstance(x, dict))
    pend  = [w for w in wr.values() if isinstance(w, dict) and w.get("status") in ("Pending", "PENDING_APPROVAL")]
    appr  = [w for w in wr.values() if isinstance(w, dict) and w.get("status") in ("Approved", "PAID", "Completed")]
    rejc  = [w for w in wr.values() if isinstance(w, dict) and w.get("status") == "Rejected"]
    u.message.reply_text(
        f"📊 *Dashboard*\n\n"
        f"👥 Total Users: `{len(users)}`\n"
        f"✅ Activated: `{act}`\n"
        f"💰 Revenue: {fmt_inr(act * 59)}\n"
        f"📈 Total Earned: {fmt_inr(earn)}\n"
        f"💸 Total Withdrawn: {fmt_inr(wdrn)}\n\n"
        f"⏳ Pending Withdrawals: `{len(pend)}` → {fmt_inr(sum(float(w.get('netAmount', w.get('amount', 0))) for w in pend))}\n"
        f"✅ Completed: `{len(appr)}`\n"
        f"❌ Rejected: `{len(rejc)}`",
        parse_mode="Markdown"
    )

def cmd_userstats(u, c):
    if not is_admin(u): return
    users = db.reference("users").get() or {}
    top = sorted(
        [{"uid": k, "email": v.get("email", "—"), "earn": float(v.get("totalEarned", 0)),
          "bal": float(v.get("balance", 0)), "refs": int(v.get("referralCount", 0))}
         for k, v in users.items() if isinstance(v, dict)],
        key=lambda x: x["earn"], reverse=True
    )[:10]
    lines = ["🏆 *Top 10 Earners*\n"]
    for i, x in enumerate(top, 1):
        lines.append(f"{i}. `{x['uid'][:8]}` — {x['email']}\n   {fmt_inr(x['earn'])} | Bal: {fmt_inr(x['bal'])} | Refs: {x['refs']}\n")
    u.message.reply_text("\n".join(lines), parse_mode="Markdown")

def cmd_topreferrers(u, c):
    if not is_admin(u): return
    users = db.reference("users").get() or {}
    top = sorted(
        [{"uid": k, "email": v.get("email", "—"), "refs": int(v.get("referralCount", 0))}
         for k, v in users.items() if isinstance(v, dict)],
        key=lambda x: x["refs"], reverse=True
    )[:10]
    lines = ["🔗 *Top 10 Referrers*\n"]
    for i, x in enumerate(top, 1):
        lines.append(f"{i}. `{x['uid'][:8]}` — {x['email']} | 👥 {x['refs']}")
    u.message.reply_text("\n".join(lines), parse_mode="Markdown")

def cmd_dailystats(u, c):
    if not is_admin(u): return
    cut   = int((datetime.now() - timedelta(days=1)).timestamp() * 1000)
    users = db.reference("users").get() or {}
    new   = [x for x in users.values() if isinstance(x, dict) and int(x.get("createdAt", 0)) >= cut]
    paid  = [x for x in new if x.get("isPaid")]
    wr    = db.reference("withdrawalRequests").get() or {}
    wt    = [w for w in wr.values() if isinstance(w, dict) and int(w.get("timestamp", 0)) >= cut]
    u.message.reply_text(
        f"📅 *Last 24 Hours*\n\n"
        f"👤 New Users: `{len(new)}`\n"
        f"✅ Activated: `{len(paid)}`\n"
        f"💰 Revenue: {fmt_inr(len(paid) * 59)}\n"
        f"💸 Withdrawals: `{len(wt)}` → {fmt_inr(sum(float(w.get('amount', 0)) for w in wt))}",
        parse_mode="Markdown"
    )

def cmd_withdrawals(u, c):
    if not is_admin(u): return
    wr   = db.reference("withdrawalRequests").get() or {}
    pend = {k: w for k, w in wr.items() if isinstance(w, dict) and w.get("status") in ("Pending", "PENDING_APPROVAL")}
    if not pend:
        u.message.reply_text("✅ No pending withdrawals.")
        return
    lines = [f"⏳ *Pending ({len(pend)})*\n"]
    for k, w in list(pend.items())[:15]:
        lines.append(
            f"📧 {w.get('email', '—')}\n"
            f"💵 {fmt_inr(w.get('amount', 0))} → Net: {fmt_inr(w.get('netAmount', w.get('amount', 0)))}\n"
            f"🏦 `{w.get('upiId', '—')}`\n"
            f"🕐 {fmt_ts(w.get('timestamp', 0))}\n{'─' * 22}\n"
        )
    u.message.reply_text("\n".join(lines), parse_mode="Markdown")

def cmd_complaints(u, c):
    if not is_admin(u): return
    cr = db.reference("complaints").get() or {}
    oc = {k: x for k, x in cr.items() if isinstance(x, dict) and x.get("status") == "open"}
    if not oc:
        u.message.reply_text("✅ No open complaints.")
        return
    lines = [f"🚨 *Open Complaints ({len(oc)})*\n"]
    for k, x in list(oc.items())[:10]:
        lines.append(
            f"📧 {x.get('email', '—')}\n"
            f"📋 {x.get('type', '—')}\n"
            f"💬 {str(x.get('message', ''))[:120]}\n"
            f"🕐 {fmt_ts(x.get('timestamp', 0))}\n{'─' * 22}\n"
        )
    u.message.reply_text("\n".join(lines), parse_mode="Markdown")

def cmd_user(u, c):
    if not is_admin(u): return
    if not c.args:
        u.message.reply_text("Usage: /user USER_ID")
        return
    uid = c.args[0].strip()
    ud  = db.reference(f"users/{uid}").get()
    if not ud:
        u.message.reply_text(f"❌ Not found: `{uid}`", parse_mode="Markdown")
        return
    wds = ud.get("withdrawals", {})
    wl  = sorted(wds.values(), key=lambda x: x.get("timestamp", 0), reverse=True)[:3] if isinstance(wds, dict) else []
    qr  = db.reference(f"qrPaymentSessions/{uid}").get() or {}
    u.message.reply_text(
        f"👤 *User Profile*\n\n"
        f"📧 `{ud.get('email', '—')}`\n"
        f"🆔 `{uid}`\n"
        f"💰 Balance: {fmt_inr(ud.get('balance', 0))}\n"
        f"📈 Earned: {fmt_inr(ud.get('totalEarned', 0))}\n"
        f"💸 Withdrawn: {fmt_inr(ud.get('totalWithdrawn', 0))}\n"
        f"👥 Referrals: `{ud.get('referralCount', 0)}`\n"
        f"🔑 {'✅ Active' if ud.get('isPaid') else '❌ Not Activated'}\n"
        f"📅 Joined: {fmt_ts(ud.get('createdAt', 0))}\n\n"
        f"🔄 QR Session: {qr.get('status', 'none')} — ₹{qr.get('amount', '—')}\n\n"
        f"*Last Withdrawals:*\n" +
        ("\n".join(f"  {fmt_inr(w.get('amount', 0))} → {w.get('status', '?')} ({fmt_ts(w.get('timestamp', 0))})" for w in wl) or "  None"),
        parse_mode="Markdown"
    )

def cmd_activate(u, c):
    if not is_admin(u): return
    if not c.args:
        u.message.reply_text("Usage: /activate USER_ID")
        return
    uid = c.args[0].strip()
    if _approve_user(uid):
        ud = db.reference(f"users/{uid}").get() or {}
        u.message.reply_text(f"✅ *Activated!*\n🆔 `{uid}`\n📧 {ud.get('email', '—')}", parse_mode="Markdown")
    else:
        u.message.reply_text(f"⚠️ Failed for `{uid}`.", parse_mode="Markdown")

def cmd_approve_tier(u, c):
    if not is_admin(u): return
    if not c.args:
        u.message.reply_text("Usage: /approve_tier USER_ID")
        return
    uid = c.args[0].strip()
    db.reference(f"users/{uid}").update({"tierPlanActive": True})
    db.reference(f"tierPlanRequests/{uid}").update({"status": "Approved"})
    ud = db.reference(f"users/{uid}").get() or {}
    u.message.reply_text(f"👑 *Tier Approved!*\n🆔 `{uid}`\n📧 {ud.get('email', '—')}", parse_mode="Markdown")

def cmd_verify_payment(u, c):
    if not is_admin(u): return
    if not c.args:
        u.message.reply_text("Usage: /verify_payment USER_ID")
        return
    uid = c.args[0].strip()
    s   = db.reference(f"qrPaymentSessions/{uid}").get()
    if not s:
        u.message.reply_text(f"❌ No QR session for: `{uid}`", parse_mode="Markdown")
        return
    if _approve_user(uid):
        u.message.reply_text(
            f"✅ *Verified & Activated!*\n🆔 `{uid}`\n📧 {s.get('email', '—')}\n💵 ₹{s.get('amount', '—')}",
            parse_mode="Markdown"
        )
    else:
        u.message.reply_text(f"⚠️ Failed for `{uid}`.", parse_mode="Markdown")

def cmd_shutdown_app(u, c):
    if not is_admin(u): return
    ts = int((datetime.now() + timedelta(days=7)).timestamp() * 1000)
    db.reference("appConfig/shutdownNotice").set({
        "isShuttingDown": True, "shutdownDate": ts,
        "customMessage": "⚠️ App closing soon. Please withdraw your balance within 7 days.",
        "refundsComplete": False,
    })
    u.message.reply_text(f"⚠️ *Shutdown activated!*\nApp closes: {fmt_ts(ts)}\n\nCancel: /cancel\\_shutdown", parse_mode="Markdown")

def cmd_cancel_shutdown(u, c):
    if not is_admin(u): return
    db.reference("appConfig/shutdownNotice").set(
        {"isShuttingDown": False, "shutdownDate": 0, "customMessage": "", "refundsComplete": False}
    )
    u.message.reply_text("✅ Shutdown cancelled.")

def cmd_update(u, c):
    if not is_admin(u): return
    raw   = u.message.text.replace("/update", "", 1).strip()
    parts = [p.strip() for p in raw.split("|")]
    if len(parts) < 3 or not parts[0] or not parts[2]:
        u.message.reply_text("Format: `/update 1.1 | What's new | https://apk-link`", parse_mode="Markdown")
        return
    db.reference("appConfig/updateInfo").update(
        {"latestVersion": parts[0], "updateMessage": parts[1], "downloadUrl": parts[2], "isForceUpdate": False}
    )
    u.message.reply_text(f"✅ *Update pushed!* v`{parts[0]}`", parse_mode="Markdown")

def cmd_force(u, c):
    if not is_admin(u): return
    raw   = u.message.text.replace("/force", "", 1).strip()
    parts = [p.strip() for p in raw.split("|")]
    if len(parts) < 3 or not parts[0] or not parts[2]:
        u.message.reply_text("Format: `/force 1.1 | What's new | https://apk-link`", parse_mode="Markdown")
        return
    db.reference("appConfig/updateInfo").update(
        {"latestVersion": parts[0], "updateMessage": parts[1], "downloadUrl": parts[2], "isForceUpdate": True}
    )
    u.message.reply_text(f"🚨 *FORCE update pushed!* v`{parts[0]}`\nUsers blocked until updated.", parse_mode="Markdown")

def cmd_cancel_update(u, c):
    if not is_admin(u): return
    db.reference("appConfig/updateInfo").update(
        {"latestVersion": "1.0", "updateMessage": "", "downloadUrl": "", "isForceUpdate": False}
    )
    u.message.reply_text("✅ Update popup removed.")

def cmd_update_status(u, c):
    if not is_admin(u): return
    data  = db.reference("appConfig/updateInfo").get() or {}
    force = data.get("isForceUpdate", False)
    u.message.reply_text(
        f"📋 *Update Info*\n\n"
        f"📦 `{data.get('latestVersion', 'not set')}`\n"
        f"📝 {data.get('updateMessage', 'none')}\n"
        f"🔗 {data.get('downloadUrl', 'none')}\n"
        f"🚨 Force: {'YES ⚠️' if force else 'No'}",
        parse_mode="Markdown"
    )


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────
def main():
    log.info("MinTask Admin Bot starting...")

    updater = Updater(TELEGRAM_BOT_TOKEN, use_context=True)
    dp      = updater.dispatcher

    updater.bot.set_my_commands(BOT_COMMANDS)

    dp.add_handler(CallbackQueryHandler(handle_button))
    for name, fn in [
        ("start",           cmd_start),
        ("dashboard",       cmd_dashboard),
        ("userstats",       cmd_userstats),
        ("topreferrers",    cmd_topreferrers),
        ("dailystats",      cmd_dailystats),
        ("withdrawals",     cmd_withdrawals),
        ("complaints",      cmd_complaints),
        ("user",            cmd_user),
        ("activate",        cmd_activate),
        ("approve_tier",    cmd_approve_tier),
        ("verify_payment",  cmd_verify_payment),
        ("shutdown_app",    cmd_shutdown_app),
        ("cancel_shutdown", cmd_cancel_shutdown),
        ("update",          cmd_update),
        ("force",           cmd_force),
        ("cancel_update",   cmd_cancel_update),
        ("update_status",   cmd_update_status),
    ]:
        dp.add_handler(CommandHandler(name, fn))

    updater.start_polling()
    log.info("Telegram polling active.")

    # Listen to qrPaymentSessions — fires when user taps Scan & Pay QR
    threading.Thread(
        target=lambda: db.reference("qrPaymentSessions").listen(qr_payment_listener),
        daemon=True,
        name="qr-listener"
    ).start()
    log.info("Listening to qrPaymentSessions/")

    # Listen to withdrawal requests
    threading.Thread(
        target=lambda: db.reference("withdrawalRequests").listen(withdrawal_listener),
        daemon=True,
        name="withdrawal-listener"
    ).start()
    log.info("Listening to withdrawalRequests/")

    log.info("Bot fully online. Waiting for payments...")
    updater.idle()


if __name__ == "__main__":
    main()