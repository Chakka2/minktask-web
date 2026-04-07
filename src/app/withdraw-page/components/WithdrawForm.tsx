'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Wallet, IndianRupee, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getClientUserId } from '@/lib/user';
import { WITHDRAW_FEE, WITHDRAW_MIN } from '@/lib/constants';

interface WithdrawFormData {
  amount: number;
  upiId: string;
  confirmUpiId: string;
}

const AVAILABLE_BALANCE = 248;
const MIN_WITHDRAWAL = WITHDRAW_MIN;
const FEE = WITHDRAW_FEE;

export default function WithdrawForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<WithdrawFormData>();

  const watchAmount = watch('amount');
  const netAmount = watchAmount ? Math.max(0, Number(watchAmount) - FEE) : 0;

  const onSubmit = async (data: WithdrawFormData) => {
    setIsSubmitting(true);
    const userId = getClientUserId();
    const res = await fetch('/api/withdraw/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        amount: Number(data.amount),
        upiId: data.upiId,
      }),
    });
    const json = await res.json();
    setIsSubmitting(false);
    if (!res.ok) {
      toast.error(json.error || 'Withdrawal request failed');
      return;
    }
    setSubmitted(true);
    toast.success(`Withdrawal submitted. Net payout after ₹2 fee: ₹${json.netAmount.toFixed(2)}.`);
    reset();
    setTimeout(() => setSubmitted(false), 4000);
  };

  if (submitted) {
    return (
      <div className="glass-card p-8 text-center animate-slide-up">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(34,197,94,0.15)' }}>
          <CheckCircle size={32} className="text-green-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Withdrawal Requested!</h3>
        <p className="text-sm text-white/50 mb-1">Your request has been submitted successfully.</p>
        <p className="text-xs text-white/30">Our team will process it within 24 hours via UPI.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
          <Wallet size={18} className="text-indigo-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Request Withdrawal</h3>
          <p className="text-xs text-white/40">Minimum ₹50 · ₹2 processing fee</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
            Withdrawal Amount (₹)
          </label>
          <div className="relative">
            <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="number"
              placeholder="Enter amount (min ₹50)"
              className="input-field pl-9"
              {...register('amount', {
                required: 'Please enter an amount',
                min: { value: MIN_WITHDRAWAL, message: `Minimum withdrawal is ₹${MIN_WITHDRAWAL}` },
                max: { value: AVAILABLE_BALANCE, message: `Maximum is your available balance ₹${AVAILABLE_BALANCE}` },
                validate: (v) => Number(v) > 0 || 'Amount must be greater than 0',
              })}
            />
          </div>
          {errors.amount && <p className="text-xs text-red-400 mt-1.5">{errors.amount.message}</p>}
          {watchAmount && Number(watchAmount) >= MIN_WITHDRAWAL && (
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-white/40">Processing fee: <span className="text-red-400 font-mono">−₹{FEE}</span></span>
              <span className="text-green-400 font-semibold font-mono">You receive: ₹{netAmount}</span>
            </div>
          )}
        </div>

        {/* UPI ID */}
        <div>
          <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">UPI ID</label>
          <input
            type="text"
            placeholder="yourname@upi or 9876543210@paytm"
            className="input-field font-mono"
            {...register('upiId', {
              required: 'Please enter your UPI ID',
              pattern: {
                value: /^[\w.\-+]+@[\w]+$/,
                message: 'Invalid UPI ID format (e.g. name@upi or number@paytm)',
              },
            })}
          />
          {errors.upiId && <p className="text-xs text-red-400 mt-1.5">{errors.upiId.message}</p>}
          <p className="text-xs text-white/30 mt-1.5">Accepted: @paytm, @ybl, @oksbi, @okaxis, @upi, @ibl and more</p>
        </div>

        {/* Confirm UPI */}
        <div>
          <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Confirm UPI ID</label>
          <input
            type="text"
            placeholder="Re-enter your UPI ID"
            className="input-field font-mono"
            {...register('confirmUpiId', {
              required: 'Please confirm your UPI ID',
              validate: (v) => v === watch('upiId') || 'UPI IDs do not match',
            })}
          />
          {errors.confirmUpiId && <p className="text-xs text-red-400 mt-1.5">{errors.confirmUpiId.message}</p>}
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <AlertCircle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-white/50 leading-relaxed">
            Double-check your UPI ID before submitting. Incorrect UPI IDs may result in payment failure. Mintask is not liable for wrong UPI entries.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ minHeight: '48px' }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Submitting Request...
            </>
          ) : (
            <>
              <Wallet size={16} />
              Request Withdrawal
            </>
          )}
        </button>
      </form>
    </div>
  );
}