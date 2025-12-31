export type Chef = {
    id: string;
    name: string;
    image: string; // URL to avatar
};

export type Ingredient = {
    name: string;
    amount: string;
    purchaseLink: string; // Coupang link
};

export type RecipeStep = {
    order: number;
    description: string;
};

export type Nutrition = {
    calories: number; // kcal
    protein: string;
    fat: string;
    carbs: string;
};

export type Recipe = {
    id: string;
    title: string;
    chefId: string;
    chefName: string; // Denormalized for convenience
    image: string; // Hero image URL
    time: string; // e.g., "15 min"
    calories: number; // Just the number for the badge
    isRecommended: boolean;
    videoUrl: string; // YouTube embed URL
    ingredients: Ingredient[];
    steps: RecipeStep[];
    nutrition: Nutrition;
};

export const CHEFS: Chef[] = [
    {
        id: 'c1',
        name: '이연복',
        image: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?q=80&w=2680&auto=format&fit=crop', // Stock photo placeholder
    },
    {
        id: 'c2',
        name: '정호영',
        image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=2577&auto=format&fit=crop',
    },
    {
        id: 'c3',
        name: '강레오',
        image: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?q=80&w=2574&auto=format&fit=crop',
    },
    {
        id: 'c5',
        name: '최현석',
        image: 'https://images.unsplash.com/photo-1595273131626-4d7835d754fa?q=80&w=2675&auto=format&fit=crop',
    },
];

export const RECIPES: Recipe[] = [
    {
        id: 'r1',
        title: '전설의 탕수육',
        chefId: 'c1',
        chefName: '이연복',
        image: 'https://images.unsplash.com/photo-1541657261262-6ff84046d959?q=80&w=2574&auto=format&fit=crop',
        time: '45 min',
        calories: 850,
        isRecommended: true,
        videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A', // Shorts example (Gordon Ramsay)
        ingredients: [
            { name: '돼지 안심', amount: '300g', purchaseLink: 'https://coupang.com' },
            { name: '전분 가루', amount: '100g', purchaseLink: 'https://coupang.com' },
        ],
        steps: [
            { order: 1, description: '돼지 안심을 깍둑썰기 합니다.' },
            { order: 2, description: '전분 물을 만들어 고기에 입힙니다.' },
            { order: 3, description: '180도 기름에 바삭하게 튀겨냅니다.' },
        ],
        nutrition: { calories: 850, protein: '45g', fat: '30g', carbs: '80g' },
    },
    {
        id: 'r2',
        title: '초간단 멘보샤',
        chefId: 'c1',
        chefName: '이연복',
        image: 'https://images.unsplash.com/photo-1563245312-6428f2877703?q=80&w=2574&auto=format&fit=crop',
        time: '30 min',
        calories: 600,
        isRecommended: false,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        ingredients: [
            { name: '새우살', amount: '200g', purchaseLink: 'https://coupang.com' },
            { name: '식빵', amount: '4장', purchaseLink: 'https://coupang.com' },
        ],
        steps: [
            { order: 1, description: '새우살을 다져서 양념합니다.' },
            { order: 2, description: '식빵 사이에 새우살을 넣습니다.' },
            { order: 3, description: '낮은 온도에서 천천히 튀깁니다.' },
        ],
        nutrition: { calories: 600, protein: '30g', fat: '40g', carbs: '50g' },
    },
    {
        id: 'r3',
        title: '우동 국물의 정석',
        chefId: 'c2',
        chefName: '정호영',
        image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=2564&auto=format&fit=crop',
        time: '60 min',
        calories: 450,
        isRecommended: true,
        videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
        ingredients: [
            { name: '우동 면', amount: '200g', purchaseLink: 'https://coupang.com' },
            { name: '쯔유', amount: '50ml', purchaseLink: 'https://coupang.com' },
        ],
        steps: [
            { order: 1, description: '육수를 진하게 우려냅니다.' },
            { order: 2, description: '면을 삶아 차가운 물에 헹굽니다.' },
        ],
        nutrition: { calories: 450, protein: '15g', fat: '10g', carbs: '70g' },
    },
    {
        id: 'r4',
        title: '완벽한 스테이크 굽기',
        chefId: 'c3',
        chefName: '강레오',
        image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=2670&auto=format&fit=crop',
        time: '20 min',
        calories: 700,
        isRecommended: true,
        videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
        ingredients: [
            { name: '소고기 채끝', amount: '250g', purchaseLink: 'https://coupang.com' },
            { name: '로즈마리', amount: '1줄기', purchaseLink: 'https://coupang.com' },
        ],
        steps: [
            { order: 1, description: '고기 핏물을 제거하고 시즈닝합니다.' },
            { order: 2, description: '팬을 아주 뜨겁게 달굽니다.' },
        ],
        nutrition: { calories: 700, protein: '60g', fat: '45g', carbs: '5g' },
    },
];
