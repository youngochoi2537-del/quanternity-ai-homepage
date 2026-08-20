'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  let title = '인증 실패';
  let description = '인증 처리 중 오류가 발생했습니다.';

  switch (reason) {
    case 'not_allowed':
      title = '접근 권한 없음';
      description = '승인되지 않은 계정입니다. 관리자 승인 후 접근 가능합니다.';
      break;
    case 'oauth_failed':
      title = 'Google 인증 실패';
      description = 'Google 계정 인증 처리 중 오류가 발생했거나 취소되었습니다.';
      break;
    case 'exchange_failed':
      title = '세션 생성 실패';
      description = '인증 세션 교환에 실패했습니다. 다시 시도해 주세요.';
      break;
    case 'no_code':
      title = '유효하지 않은 링크';
      description = '인증 코드가 없거나 만료된 접근입니다.';
      break;
    default:
      break;
  }

  return (
    <div className="w-full max-w-md bg-[#111A2E] border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-6 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-950/50 border border-red-500/40 text-red-400 mb-1">
        <ShieldAlert className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-xs text-gray-300 leading-relaxed font-sans">{description}</p>
      </div>

      <div className="pt-4 border-t border-gray-800">
        <Link
          href="/login"
          className="w-full py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs rounded-xl inline-flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>로그인 화면으로 돌아가기</span>
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4 font-sans text-white">
      <Suspense fallback={<div className="text-xs font-mono text-gray-400">Loading...</div>}>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
