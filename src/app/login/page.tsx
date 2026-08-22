'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { Phone, User, Zap, Shield, ArrowRight, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ThemeToggle from '@/components/ui/ThemeToggle';
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
      setAuth(res.user, res.token);
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
    <main className="h-screen w-screen flex overflow-hidden bg-[var(--surface-base)]">

      {/* ── LEFT HALF: Hero Image (full height) ── */}
      <div className="hidden lg:flex w-1/2 h-full relative flex-col bg-[#FAF8F5] dark:bg-[#0B0F19] items-center justify-between p-8 xl:p-12 overflow-hidden border-r border-[var(--border-subtle)]">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Content over image */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-md pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-4 shadow-sm border border-teal-200 dark:border-teal-800/40">
            <Sparkles size={12} className="text-teal-600 dark:text-teal-400" />
            Seamless Real-Time Connection
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight text-gray-900 dark:text-white tracking-tight">
            Chat with anyone, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-indigo-600 to-purple-600 dark:from-teal-400 dark:via-indigo-300 dark:to-purple-400">anywhere</span>.
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm xl:text-base mt-2.5 leading-relaxed">
            Experience blazing fast messaging with instant WebSocket delivery and clean design.
          </p>
        </div>

        {/* Illustration image */}
        <div className="relative w-full max-w-sm xl:max-w-md aspect-square my-auto z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:scale-102 transition-transform duration-500">
          <Image
            src="/login-hero.png"
            alt="AltChat Messaging Illustration"
            fill
            sizes="(max-width: 1024px) 100vw, 480px"
            className="object-contain"
            priority
          />
        </div>

        {/* Bottom: footer text */}
        <div className="relative z-10 text-center pb-2">
          <p className="text-gray-400 dark:text-gray-500 text-xs font-medium tracking-wide">
            © {new Date().getFullYear()} AltChat Inc. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── RIGHT HALF: Login Form (full height) ── */}
      <div className="w-full lg:w-1/2 h-full flex flex-col bg-[var(--surface-base)] relative overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 sm:px-10 pt-6">
          <Link
            href="/"
            className="text-xs font-medium text-[var(--text-muted)] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1"
          >
            ← Home
          </Link>
          <ThemeToggle />
        </div>

        {/* Centered form content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-8">
          <div className="w-full max-w-sm animate-fade-in">

            {/* Logo & Tagline */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-2xl border-2 border-indigo-500/30 dark:border-indigo-400/40 mb-4 bg-white hover:scale-105 transition-transform duration-300">
                <Image
                  src="/logo.jpg"
                  alt="AltChat Logo"
                  fill
                  sizes="(max-width: 640px) 80px, 96px"
                  className="object-cover"
                  priority
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gradient tracking-tight">
                AltChat
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-1.5 max-w-xs">
                Chat with your friends, organization etc.
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border-subtle)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 sm:p-8">
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Sign in to AltChat</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1.5">
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
                  placeholder="Antor Chandra Das"
                  autoComplete="name"
                  leftIcon={<User size={16} />}
                  error={errors.name?.message}
                  {...register('name')}
                />

                <Button
                  type="submit"
                  id="login-submit-btn"
                  className="w-full mt-2 h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-md hover:shadow-lg"
                  loading={isSubmitting}
                >
                  {isSubmitting ? 'Signing in…' : (
                    <span className="flex items-center gap-2">
                      Continue to AltChat <ArrowRight size={16} />
                    </span>
                  )}
                </Button>
              </form>
            </div>

            <p className="text-center text-xs text-[var(--text-muted)] mt-4">
              New to AltChat? Your account is created automatically upon first login.
            </p>
          </div>
        </div>
      </div>

    </main>
  );
}
