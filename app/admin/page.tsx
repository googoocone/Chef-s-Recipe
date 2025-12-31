import Link from 'next/link';
import { Wand2, Database, LayoutDashboard, ArrowLeft, ChefHat } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-900 rounded-2xl text-white shadow-lg">
                            <LayoutDashboard size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">Admin Dashboard</h1>
                            <p className="text-gray-500 font-medium">Chef's Recipe 관리자 페이지</p>
                        </div>
                    </div>
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                        <ArrowLeft size={18} />
                        메인으로 돌아가기
                    </Link>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Tool 1: AI Crawler */}
                    <Link href="/admin/crawler" className="group relative bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                        <div className="absolute top-8 right-8 text-gray-300 group-hover:text-purple-500 transition-colors">
                            <Wand2 size={40} />
                        </div>
                        <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                            <Wand2 size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">AI Recipe Crawler</h2>
                        <p className="text-gray-500 leading-relaxed">
                            유튜브 영상 URL을 입력하여 레시피 데이터를 자동으로 추출하고 저장합니다.
                        </p>
                    </Link>

                    {/* Tool 2: Helper / Seeding */}
                    <Link href="/admin/seed" className="group relative bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                        <div className="absolute top-8 right-8 text-gray-300 group-hover:text-green-500 transition-colors">
                            <Database size={40} />
                        </div>
                        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                            <Database size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Data Seeding</h2>
                        <p className="text-gray-500 leading-relaxed">
                            데이터베이스 초기화 및 더미 데이터(셰프, 레시피)를 생성합니다.
                        </p>
                    </Link>

                    {/* Tool 3: Chef Management */}
                    <Link href="/admin/chefs" className="group relative bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                        <div className="absolute top-8 right-8 text-gray-300 group-hover:text-orange-500 transition-colors">
                            <ChefHat size={40} />
                        </div>
                        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform">
                            <ChefHat size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Chef Management</h2>
                        <p className="text-gray-500 leading-relaxed">
                            등록된 셰프의 이름과 프로필 이미지를 수정합니다.
                        </p>
                    </Link>

                </div>
            </div>
        </div>
    );
}
