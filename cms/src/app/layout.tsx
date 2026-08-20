import type { Metadata } from 'next';
import './globals.css';
import CmsLayout from '@/components/cms-layout';

export const metadata: Metadata = {
  title: 'Quanternity AI — CMS 관리 콘솔',
  description: 'AI 거버넌스 및 ISO 컴플라이언스 통합 관리 시스템',
  robots: {
    index: false,
    follow: false,
  },
  // 네이버 서치어드바이저 소유확인 — 삭제 금지
  verification: {
    // TODO: google: 'google-site-verification-code-here',
    other: {
      'naver-site-verification': 'c0521f7fab504ab73d5534aab72639841ef20d1c',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        <CmsLayout>{children}</CmsLayout>
      </body>
    </html>
  );
}
