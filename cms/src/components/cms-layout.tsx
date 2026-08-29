'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  Megaphone,
  GraduationCap,
  Users,
  BookOpenCheck,
  LogOut,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface CmsLayoutProps {
  children: React.ReactNode;
}

export default function CmsLayout({ children }: CmsLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { label: '대시보드', href: '/', icon: LayoutDashboard },
    { label: '견적 요청 관리', href: '/quotes', icon: FileSpreadsheet },
    { label: '가이드북·자료 & 발송 이력', href: '/guidebooks', icon: BookOpenCheck },
    { label: '인사이트 관리', href: '/insights', icon: FileText },
    { label: '규제 매핑 관리', href: '/regulations', icon: ShieldCheck },
    { label: '배너 & 히어로', href: '/banners', icon: Megaphone },
    { label: '교육 일정 관리', href: '/training', icon: GraduationCap },
    { label: '리드·진단 데이터 (읽기 전용)', href: '/leads', icon: Users },
  ];

  if (pathname.startsWith('/login') || pathname.startsWith('/auth/')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F5F4EF] text-[#0B1220] flex flex-col md:flex-row font-sans relative overflow-x-hidden">
      
      {/* Mobile Dark Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Desktop Permanent + Mobile Drawer) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0B1220] text-[#F5F4EF] flex flex-col flex-shrink-0 border-r border-[#1F2937] transform transition-transform duration-200 ease-in-out md:transform-none ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#10B981] flex items-center justify-center font-bold text-black text-xs">
              Q
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                Quanternity <span className="text-[#10B981]">CMS</span>
              </div>
              <div className="text-[11px] text-gray-400 font-mono">v1.0 · Admin Console</div>
            </div>
          </div>
          {/* Close button for mobile drawer */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 rounded-md text-gray-400 hover:text-white md:hidden"
            aria-label="메뉴 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#10B981] text-black font-semibold shadow-sm'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-gray-800 space-y-3 bg-[#080E1A]">
          <a
            href="https://quanternity.kr"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between text-[11px] text-gray-400 hover:text-[#10B981] transition-colors"
          >
            <span>quanternity.kr 바로가기</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gray-800 hover:bg-red-600/90 text-gray-200 hover:text-white rounded-md text-xs font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-[1440px]">
        {/* Top Header Bar */}
        <header className="h-14 bg-white border-b border-[#E5E3DA] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 text-gray-700 hover:text-black rounded-lg hover:bg-gray-100 md:hidden flex items-center justify-center"
              aria-label="메뉴 열기"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="text-xs font-mono text-gray-500 truncate max-w-[150px] sm:max-w-none">
              Current Path: <span className="text-[#0B1220] font-semibold">{pathname}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-mono border border-emerald-200 truncate max-w-[140px] sm:max-w-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
              <span className="truncate">scoc0505@gmail.com</span>
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
