
import os
import logging
import threading
import time
from datetime import datetime, timezone
import firebase_admin
from firebase_admin import credentials, firestore
from telegram import Update, BotCommand, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Updater, CommandHandler, CallbackQueryHandler, CallbackContext


def load_env_file(path: str = ".env") -> None:
    """Minimal .env loader so script works without shell-exported vars."""
    if not os.path.exists(path):
        return
    try:
        with open(path, "r", encoding="utf-8") as f:
            for raw in f:
                line = raw.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key and key not in os.environ:
                    os.environ[key] = value
    except Exception:
        # Keep booting with existing environment if .env parse fails.
        pass


load_env_file()
# =========================
# CONFIG (use env vars)
# =========================
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
ADMIN_CHAT_ID = os.environ.get("TELEGRAM_ADMIN_CHAT_ID", "")
SERVICE_ACCOUNT_FILE = os.environ.get(
    "FIREBASE_SERVICE_ACCOUNT",
    "mintytask1-firebase-adminsdk-fbsvc-e2896d3a9f.json",
)
logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
log = logging.getLogger("earnhub-admin-bot")
if not TELEGRAM_BOT_TOKEN or not ADMIN_CHAT_ID:
    raise RuntimeError("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID env var.")
log.info("Using service account file: %s", SERVICE_ACCOUNT_FILE)
if not firebase_admin._apps:
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        raise FileNotFoundError(
            f"Service account file not found: {SERVICE_ACCOUNT_FILE}\n"
            "Set FIREBASE_SERVICE_ACCOUNT or place serviceAccountKey.json in this folder."
        )
    firebase_admin.initialize_app(credentials.Certificate(SERVICE_ACCOUNT_FILE))
db = firestore.client()
REEL_BUNDLE_PRICE = 99
REEL_REFERRAL_COMMISSION = 50
ENTRY_REFERRAL_COMMISSION = 20


def send_pending_alerts_loop(bot):
    """Poll Firestore and send one Telegram alert for each new pending entry."""
    while True:
        try:
            docs = db.collection("entryPayPending").where("status", "==", "pending").stream()
            for doc in docs:
                data = doc.to_dict() or {}
                if data.get("alertSent") is True:
                    continue

                token = doc.id
                user_id = str(data.get("userId", ""))
                amount = safe_amount(data.get("amount"))
                kind = str(data.get("kind", "entry"))
                heading = "Bundle payment request" if kind == "reel_bundle" else "Entry payment request"
                text = (
                    f"{heading}\n\n"
                    f"User: `{user_id}`\n"
                    f"Amount: *₹{amount:.2f}*\n\n"
                    "Confirm if this amount is received."
                )
                keyboard = InlineKeyboardMarkup(
                    [[
                        InlineKeyboardButton("Approve", callback_data=f"eap:{token}"),
                        InlineKeyboardButton("Deny", callback_data=f"edn:{token}"),
                    ]]
                )
                bot.send_message(
                    chat_id=ADMIN_CHAT_ID,
                    text=text,
                    parse_mode="Markdown",
                    reply_markup=keyboard,
                )
                db.collection("entryPayPending").document(token).set(
                    {
                        "alertSent": True,
                        "alertSentAt": firestore.SERVER_TIMESTAMP,
                    },
                    merge=True,
                )
                log.info("Alert sent token=%s user=%s amount=%.2f", token, user_id, amount)
        except Exception as e:
            log.error("pending-alert loop error: %s", e)
        time.sleep(2)


def is_admin(update: Update) -> bool:
    return str(update.effective_chat.id) == str(ADMIN_CHAT_ID)
def safe_amount(v) -> float:
    try:
        return float(v or 0)
    except Exception:
        return 0.0
def cmd_start(update: Update, context: CallbackContext):
    if not is_admin(update):
        return
    update.message.reply_text(
        "EarnHub admin bot online.\n\n"
        "This bot only handles:\n"
        "- Payment Approve / Deny callbacks\n"
        "- /stats"
    )
def cmd_stats(update: Update, context: CallbackContext):
    if not is_admin(update):
        return
    users = db.collection("users").get()
    payments = db.collection("payments").where("status", "==", "confirmed").get()
    total_users = len(list(users))
    confirmed = list(payments)
    entry_revenue = sum(safe_amount(d.to_dict().get("amount")) for d in confirmed)
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_new_users = db.collection("users").where("createdAt", ">=", today_start).get()
    today_count = len(list(today_new_users))
    update.message.reply_text(
        f"EarnHub Stats\n\n"
        f"Total Users: {total_users}\n"
        f"New Joins Today: {today_count}\n"
        f"Confirmed Entries: {len(confirmed)}\n"
        f"Entry Revenue: ₹{entry_revenue:.2f}"
    )
def approve_token(token: str):
    ref = db.collection("entryPayPending").document(token)
    snap = ref.get()
    if not snap.exists:
        return False, "Request expired or invalid"
    data = snap.to_dict() or {}
    if data.get("status") != "pending":
        return False, "Already handled"
    user_id = str(data.get("userId", ""))
    amount = safe_amount(data.get("amount"))
    kind = str(data.get("kind", "entry"))
    batch = db.batch()
    batch.update(ref, {"status": "approved", "decidedAt": firestore.SERVER_TIMESTAMP})
    if kind == "reel_bundle":
        buyer_id = str(data.get("buyerId", user_id))
        referrer_id = data.get("referrerId")
        bundle_id = str(data.get("bundleId", ""))
        sale_ref = db.collection("reelSales").document()
        batch.set(
            sale_ref,
            {
                "buyerId": buyer_id,
                "referrerId": referrer_id if referrer_id else None,
                "bundleId": bundle_id,
                "price": REEL_BUNDLE_PRICE,
                "referralCommission": REEL_REFERRAL_COMMISSION if referrer_id else 0,
                "adminProfit": REEL_BUNDLE_PRICE - REEL_REFERRAL_COMMISSION if referrer_id else REEL_BUNDLE_PRICE,
                "createdAt": firestore.SERVER_TIMESTAMP,
            },
        )
        batch.set(
            db.collection("users").document(buyer_id),
            {"isLocked": False},
            merge=True,
        )
        batch.set(
            db.collection("payments").document(f"reel_{sale_ref.id}"),
            {
                "userId": buyer_id,
                "amount": REEL_BUNDLE_PRICE,
                "status": "confirmed",
                "type": "reel_bundle",
                "bundleId": bundle_id,
                "confirmedAt": firestore.SERVER_TIMESTAMP,
                "source": "admin_telegram_python",
            },
        )
        if referrer_id:
            tx_ref = db.collection("transactions").document()
            batch.set(
                db.collection("users").document(str(referrer_id)),
                {"walletBalance": firestore.Increment(REEL_REFERRAL_COMMISSION)},
                merge=True,
            )
            batch.set(
                tx_ref,
                {
                    "userId": str(referrer_id),
                    "type": "reel_commission",
                    "amount": REEL_REFERRAL_COMMISSION,
                    "sourceId": sale_ref.id,
                    "createdAt": firestore.SERVER_TIMESTAMP,
                },
            )
    else:
        user_snap = db.collection("users").document(user_id).get()
        user_data = user_snap.to_dict() or {}
        referrer_id = user_data.get("referredBy")
        batch.set(
            db.collection("payments").document(user_id),
            {
                "userId": user_id,
                "amount": amount,
                "status": "confirmed",
                "confirmedAt": firestore.SERVER_TIMESTAMP,
                "source": "admin_telegram_python",
            },
        )
        batch.set(
            db.collection("users").document(user_id),
            {"isLocked": False},
            merge=True,
        )
        if referrer_id and not user_data.get("entryReferralPaid"):
            tx_ref = db.collection("transactions").document()
            batch.set(
                db.collection("users").document(str(referrer_id)),
                {"walletBalance": firestore.Increment(ENTRY_REFERRAL_COMMISSION)},
                merge=True,
            )
            batch.set(
                db.collection("users").document(user_id),
                {"entryReferralPaid": True},
                merge=True,
            )
            batch.set(
                tx_ref,
                {
                    "userId": str(referrer_id),
                    "type": "entry_referral",
                    "amount": ENTRY_REFERRAL_COMMISSION,
                    "sourceId": user_id,
                    "createdAt": firestore.SERVER_TIMESTAMP,
                },
            )
    batch.commit()
    if kind == "reel_bundle":
        return True, f"APPROVED\nBundle Payment\nUser: {user_id}\nAmount: ₹{amount:.2f}"
    return True, f"APPROVED\nEntry Payment\nUser: {user_id}\nAmount: ₹{amount:.2f}"
def deny_token(token: str):
    ref = db.collection("entryPayPending").document(token)
    snap = ref.get()
    if not snap.exists:
        return False, "Request expired or invalid"
    data = snap.to_dict() or {}
    if data.get("status") != "pending":
        return False, "Already handled"
    user_id = str(data.get("userId", ""))
    amount = safe_amount(data.get("amount"))
    kind = str(data.get("kind", "entry"))
    batch = db.batch()
    batch.update(ref, {"status": "denied", "decidedAt": firestore.SERVER_TIMESTAMP})
    payment_doc_id = user_id if kind != "reel_bundle" else f"reel_denied_{token}"
    batch.set(
        db.collection("payments").document(payment_doc_id),
        {
            "userId": user_id,
            "amount": amount,
            "status": "denied",
            "type": "reel_bundle" if kind == "reel_bundle" else "entry",
            "deniedAt": firestore.SERVER_TIMESTAMP,
            "source": "admin_telegram_python",
        },
        merge=True,
    )
    if kind != "reel_bundle":
        batch.set(
            db.collection("users").document(user_id),
            {"isLocked": True},
            merge=True,
        )
    batch.commit()
    if kind == "reel_bundle":
        return True, f"DENIED\nBundle Payment\nUser: {user_id}\nAmount: ₹{amount:.2f}"
    return True, f"DENIED\nEntry Payment\nUser: {user_id}\nAmount: ₹{amount:.2f}"
def handle_callback(update: Update, context: CallbackContext):
    q = update.callback_query
    q.answer("Processing...")
    if str(q.message.chat.id) != str(ADMIN_CHAT_ID):
        q.edit_message_text("Unauthorized chat.")
        return
    data = (q.data or "").strip()
    try:
        if data.startswith("eap:"):
            token = data[4:]
            ok, msg = approve_token(token)
            q.edit_message_text(msg if ok else f"Error: {msg}")
            return
        if data.startswith("edn:"):
            token = data[4:]
            ok, msg = deny_token(token)
            q.edit_message_text(msg if ok else f"Error: {msg}")
            return
        q.edit_message_text("Unknown action.")
    except Exception as e:
        log.exception("Callback error")
        q.edit_message_text(f"Error: {e}")
def main():
    updater = Updater(token=TELEGRAM_BOT_TOKEN, use_context=True)
    dp = updater.dispatcher
    updater.bot.set_my_commands([
        BotCommand("start", "Bot status"),
        BotCommand("stats", "Basic stats"),
    ])
    dp.add_handler(CommandHandler("start", cmd_start))
    dp.add_handler(CommandHandler("stats", cmd_stats))
    dp.add_handler(CallbackQueryHandler(handle_callback))

    threading.Thread(
        target=lambda: send_pending_alerts_loop(updater.bot),
        daemon=True,
        name="pending-alerts",
    ).start()

    log.info("Bot running (polling)...")
    updater.start_polling(drop_pending_updates=True)
    updater.idle()
if __name__ == "__main__":
    main()