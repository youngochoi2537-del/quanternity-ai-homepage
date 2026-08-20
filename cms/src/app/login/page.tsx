'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mail, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('scoc0505@gmail.com');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [showMagicForm, setShowMagicForm] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const supabase = createClient();

  // 60-second Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  // Google OAuth Handler
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setMessage(null);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://cms.quanternity.kr');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      setGoogleLoading(false);
      setMessage({
        type: 'error',
        text: `Google 로그인 오류: ${error.message}`,
      });
    }
  };

  // Magic Link Handler (Backup Auth Path)
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || cooldown > 0) return;

    setMagicLoading(true);
    setMessage(null);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://cms.quanternity.kr');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
        shouldCreateUser: false, // Prevent unauthorized signups
      },
    });

    setMagicLoading(false);

    if (error) {
      let errorMessage = error.message;
      if (
        errorMessage.toLowerCase().includes('rate limit') ||
        errorMessage.toLowerCase().includes('too many requests') ||
        error.status === 429
      ) {
        errorMessage = '보안을 위해 요청 횟수가 제한되었습니다. 60초 후 다시 시도해 주세요.';
      } else if (errorMessage.toLowerCase().includes('user not found') || errorMessage.toLowerCase().includes('signups not allowed')) {
        errorMessage = '등록된 관리자 계정만 매직링크를 발송할 수 있습니다.';
      }

      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } else {
      setCooldown(60); // Start 60-second cooldown
      setMessage({
        type: 'success',
        text: `'${email}' 주소로 관리자 로그인 매직 링크가 발송되었습니다. (60초 후 재발송 가능)`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-w-md bg-[#111A2E] border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Quanternity <span className="text-[#10B981]">CMS</span>
          </h1>
          <p className="text-xs text-gray-400 font-mono">
            AI 거버넌스 및 ISO 컴플라이언스 통합 관리 콘솔
          </p>
        </div>

        {/* Primary CTA: Google OAuth Login Button */}
        <div className="space-y-4 pt-2">
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-gray-900 font-semibold text-sm rounded-xl flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.99] disabled:opacity-60"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{googleLoading ? 'Google 연결 중...' : 'Google 계정으로 로그인'}</span>
          </button>
        </div>

        {/* Secondary Accordion Link */}
        <div className="pt-2 border-t border-gray-800">
          <button
            onClick={() => setShowMagicForm(!showMagicForm)}
            className="w-full flex items-center justify-between text-xs text-gray-400 hover:text-gray-200 transition-colors py-1 font-mono"
          >
            <span>Google 로그인이 어려우신가요?</span>
            {showMagicForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Expandable Magic Link Form */}
          {showMagicForm && (
            <form onSubmit={handleMagicLink} className="mt-3 space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">
                  이메일 매직링크 (보조 인증)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="scoc0505@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#10B981] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={magicLoading || cooldown > 0}
                className="w-full py-2.5 px-4 bg-[#10B981] hover:bg-[#059669] text-black font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {magicLoading ? (
                  <span>매직링크 발송 중...</span>
                ) : cooldown > 0 ? (
                  <span>재발송 대기 중 ({cooldown}초)</span>
                ) : (
                  <>
                    <span>이메일 매직 링크로 로그인</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Status Messages */}
        {message && (
          <div
            className={`p-3.5 rounded-lg text-xs flex items-start gap-2.5 border ${
              message.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/40 border-red-500/40 text-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed">{message.text}</div>
          </div>
        )}

        {/* Security Footer Notice */}
        <div className="pt-4 border-t border-gray-800 text-center">
          <p className="text-[11px] text-gray-500 leading-normal">
            * 승인된 관리자 계정만 접속이 허용됩니다.<br />
            Google OAuth 주 인증과 60초 쿨다운 보안 이행 정책이 적용되어 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
