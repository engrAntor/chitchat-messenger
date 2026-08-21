'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Phone, User, MessageSquare, Zap, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/api';

const schema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+[1-9]\d{6,14}$/, 'Use international format, e.g. +15551234567'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login({ phone: data.phone, name: data.name });
      // Store auth
      setAuth(res.user, res.token);
      // Set cookie for middleware
      document.cookie = `chat_token=${res.token}; path=/; max-age=86400; SameSite=Lax`;
      toast.success(`Welcome, ${res.user.name}!`);
      router.replace('/chat');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Something went wrong. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[var(--surface-base)]">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 mb-4">
            <MessageSquare size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">Pulse</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Real-time chat, reinvented</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-elevated)] p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Sign in to Pulse</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              No password needed — just your phone number.
            </p>
          </div>

          <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              id="login-phone"
              label="Phone Number"
              type="tel"
              placeholder="+15551234567"
              autoComplete="tel"
              autoFocus
              leftIcon={<Phone size={16} />}
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              id="login-name"
              label="Your Name"
              type="text"
              placeholder="Ada Lovelace"
              autoComplete="name"
              leftIcon={<User size={16} />}
              error={errors.name?.message}
              {...register('name')}
            />

            <Button
              type="submit"
              id="login-submit-btn"
              className="w-full mt-2 h-12 text-base font-semibold"
              loading={isSubmitting}
            >
              {isSubmitting ? 'Signing in…' : 'Continue with Phone'}
            </Button>
          </form>

          {/* Trust badges */}
          <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] flex items-center justify-center gap-6">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <Shield size={12} className="text-indigo-400" />
              End-to-end secure
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <Zap size={12} className="text-indigo-400" />
              Real-time messaging
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] mt-4">
          New to Pulse? A new account is created automatically.
        </p>
      </div>
    </main>
  );
}
