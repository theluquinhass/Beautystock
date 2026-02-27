import { memo } from "react";

const CategoryChips = memo(({ categories, activeCategoryId }) => {
    if (!categories || categories.length === 0) return null;

    const scrollToCategory = (id) => {
        const element = document.getElementById(`category-${id}`);
        // Calculate offset to account for sticky header and chips (roughly 140px on mobile)
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 150;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-[#fdf2f8]/95 backdrop-blur-md sticky top-[125px] lg:top-[140px] z-40 border-b border-pink-100/50 -mx-4 px-4 sm:mx-0 sm:px-0 sm:bg-transparent sm:backdrop-blur-none sm:top-0 sm:relative sm:border-none sm:mb-6 pt-3 pb-3 sm:py-0">
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 lg:gap-1.5 sm:gap-3 no-scrollbar pb-1 sm:pb-0 snap-x">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => scrollToCategory(cat.id)}
                        className={`snap-start flex items-center justify-between lg:w-full flex-shrink-0 px-4 lg:px-3 py-2 lg:py-2.5 rounded-full lg:rounded-xl font-bold text-sm transition-all border lg:border-transparent ${activeCategoryId === cat.id
                                ? 'bg-pink-500 lg:bg-pink-50 border-pink-500 lg:border-pink-50 text-white lg:text-pink-600 shadow-soft lg:shadow-none'
                                : 'bg-white border-pink-100 lg:bg-transparent text-gray-600 hover:border-pink-300 lg:hover:bg-gray-50 hover:text-pink-600 shadow-sm lg:shadow-none'
                            }`}
                    >
                        <div className="flex items-center gap-2 truncate pr-2">
                            <span
                                className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: activeCategoryId === cat.id ? 'var(--color-primary)' : cat.color || '#ec4899', opacity: activeCategoryId === cat.id ? 1 : 0.7 }}
                            />
                            <span className="truncate">{cat.name}</span>
                        </div>
                        <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-md lg:rounded-lg opacity-80 ${activeCategoryId === cat.id ? 'bg-white/20 lg:bg-pink-100' : 'bg-gray-100 lg:bg-gray-100 text-gray-400'
                            }`}>
                            {cat.products?.length || 0}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
});

export default CategoryChips;
