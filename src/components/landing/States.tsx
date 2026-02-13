'use client';

interface StatesProps {
    onLinkClick: (tabId: string) => void;
}

import { getStatesData } from '@/lib/data-parser';

export function States({ onLinkClick }: StatesProps) {
    const statesData = getStatesData();

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
            {/* Dangerous HTML is used here for the bold tags - make sure the content is trusted */}
            <p
                className="mt-3 sm:text-lg"
                dangerouslySetInnerHTML={{ __html: statesData.heading }}
            />

            <div className="mt-3 flex flex-col sm:flex-row text-sm gap-3 lg:hidden">
                {statesData.services.map(service => (
                    <div key={service.id} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                        <a
                            onClick={() => onLinkClick(service.id)}
                            href="#services"
                            className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline"
                        >
                            {service.title}
                        </a>
                    </div>
                ))}
            </div>
        </section>
    );
}
