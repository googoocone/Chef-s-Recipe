'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto group">
            <button type="submit" className="absolute inset-y-0 left-0 pl-6 flex items-center text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300">
                <Search size={28} />
            </button>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-16 pr-6 py-5 text-lg rounded-full bg-white text-gray-800 placeholder-gray-400 outline-none transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:shadow-[0_20px_40px_rgb(0,0,0,0.1)] focus:-translate-y-1 border border-transparent focus:border-orange-100"
                placeholder="어떤 셰프의 레시피를 찾으시나요?"
            />
        </form>
    );
}
