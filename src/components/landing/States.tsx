
'use client';

interface StatesProps {
    onLinkClick: (tabId: string) => void;
    servicesList?: { id: string, title: string }[];
}

export function States({ onLinkClick, servicesList }: StatesProps) {
    const heading = "Get <b>best deals</b> across <b>India</b> with <b>zero charges</b> — 100% hassle-free services!";

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
            <p
                className="mt-3 sm:text-lg"
                dangerouslySetInnerHTML={{ __html: heading }}
            />

            {servicesList && (
                <div className="mt-3 flex flex-col sm:flex-row text-sm gap-3 lg:hidden">
                    {servicesList.map(service => (
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
            )}
        </section>
    );
}
