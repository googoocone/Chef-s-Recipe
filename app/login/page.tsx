'use client';

import { createBrowserClient } from '@supabase/ssr';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleKakaoLogin = async () => {
        try {
            setIsLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'kakao',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error('Login error:', error);
            alert('로그인 요청 중 오류가 발생했습니다.');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
            <div className="w-full max-w-sm text-center">
                <h1 className="text-3xl font-black text-gray-900 mb-2">환영합니다! 👋</h1>
                <p className="text-gray-500 mb-10">
                    로그인하고 나만의 레시피북을 만들어보세요.
                </p>

                <button
                    onClick={handleKakaoLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 bg-[#FAE100] hover:bg-[#FDD835] text-[#371D1E] font-bold py-4 rounded-2xl transition-all shadow-sm active:scale-[0.98]"
                >
                    {isLoading ? (
                        <span className="animate-pulse">연결 중...</span>
                    ) : (
                        <>
                            <MessageCircle className="w-6 h-6 fill-[#371D1E]" />
                            <span>카카오로 3초 만에 시작하기</span>
                        </>
                    )}
                </button>

                <p className="mt-8 text-xs text-gray-400">
                    계속 진행하면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
                </p>
            </div>
        </div>
    );
}
