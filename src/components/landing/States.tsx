
'use client';

import { getStatesData } from '@/lib/data-parser';

interface StatesProps {
    onLinkClick: (tabId: string) => void;
}

export function States({ onLinkClick }: StatesProps) {
    const statesData = getStatesData();

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 animate-in fade-in slide-in-from-top duration-500">
            <p
                className="text-lg md:text-xl text-foreground/80 leading-relaxed font-headline"
                dangerouslySetInnerHTML={{ __html: statesData.heading }}
            />

            <div className="mt-4 flex flex-wrap gap-4 lg:hidden">
                {statesData.services.map(service => (
                    <div key={service.id} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                        <button
                            onClick={() => onLinkClick(service.id)}
                            className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline uppercase tracking-wide"
                        >
                            {service.title}
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
