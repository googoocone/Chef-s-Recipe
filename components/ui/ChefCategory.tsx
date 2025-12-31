'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Chef } from '@/lib/placeholder-data';

interface ChefCategoryProps {
    chefs: Chef[];
}

export default function ChefCategory({ chefs }: ChefCategoryProps) {
    return (
        <div className="w-full overflow-x-auto pb-8 pt-4 no-scrollbar">
            <div className="flex space-x-8 px-4 justify-center min-w-max">
                {chefs.map((chef) => (
                    <Link href={`/chef/${chef.id}`} key={chef.id} className="flex flex-col items-center group cursor-pointer">
                        <div className="relative w-24 h-24 rounded-full p-1 bg-white shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:ring-4 group-hover:ring-orange-50">
                            <div className="relative w-full h-full rounded-full overflow-hidden">
                                <Image
                                    src={chef.image}
                                    alt={chef.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                        </div>
                        <span className="mt-4 text-base font-semibold text-gray-700 tracking-wide group-hover:text-orange-600 transition-colors">
                            {chef.name} 셰프
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
