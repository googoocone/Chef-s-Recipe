import Link from 'next/link';
import { ChefHat } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-orange-600 p-2 rounded-xl text-white shadow-lg shadow-orange-200 transition-transform group-hover:rotate-12">
                            <ChefHat size={28} strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-gray-900">
                            Chef's <span className="text-orange-600">Recipe</span>
                        </span>
                    </Link>

                    {/* Right Menu (Placeholder) */}
                    <div className="hidden md:flex gap-8 items-center font-medium text-gray-500">
                        <button className="bg-gray-900 text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                            로그인
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
