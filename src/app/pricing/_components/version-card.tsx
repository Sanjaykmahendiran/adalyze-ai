'use client';

import React, { JSX, useEffect, useState } from 'react';
import Image from 'next/image';
import { CheckCircle, Loader2, Clock } from 'lucide-react';


interface VersionData {
    version_id: number;
    version_name: string;
    title: string;
    description: string;
    status: string;
    release_date: string;
    estatus: number;
    created_date: string;
    modified_date: string;
    image: string;
}

const VersionCard: React.FC = () => {
    const [versions, setVersions] = useState<VersionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVersions = async () => {
            try {
                const response = await fetch('https://adalyzeai.xyz/App/api.php?gofor=versionlist');
                if (!response.ok) throw new Error('Failed to fetch versions');
                const data = await response.json();
                setVersions(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchVersions();
    }, []);

    /** Dynamically maps status text to respective images */
    const getStatusVisuals = (status: string) => {
        const key = status.trim().toLowerCase();

        const visuals: Record<
            string,
            { badgeText: string; badgeColor: string; badgeIcon: JSX.Element }
        > = {
            released: {
                badgeText: 'Released',
                badgeColor: 'bg-[#171717] text-green-600 border border-green-500/30',
                badgeIcon: <CheckCircle className="inline-block mr-1 w-4 h-4" />,
            },
            inprogress: {
                badgeText: 'In Progress',
                badgeColor: 'bg-[#171717] text-yellow-600 border border-yellow-500/30',
                badgeIcon: <Loader2 className="inline-block mr-1 w-4 h-4 " />,
            },
            planned: {
                badgeText: 'Planned',
                badgeColor: 'bg-[#171717] text-blue-600 border border-blue-500/30',
                badgeIcon: <Clock className="inline-block mr-1 w-4 h-4" />,
            },
        };

        return visuals[key] || visuals['planned'];
    };

    const parseFeatures = (description: string): string[] =>
        description.split(',').map((f) => f.trim());

    if (loading) {
        return (
            <section className="py-16 px-6 max-w-6xl mx-auto text-white">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                    Adalyze AI Version Log
                </h2>
                <div className="flex justify-center">
                    <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-primary rounded-full" />
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-16 px-6 max-w-6xl mx-auto text-white">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                    Adalyze AI Version Log
                </h2>
                <div className="text-center text-red-400">Error: {error}</div>
            </section>
        );
    }

    return (
        <section
            id="updatesSection"
            className="py-16 px-6 max-w-6xl mx-auto text-white"
        >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Adalyze AI Version Log
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {versions.map((version) => {
                    const visuals = getStatusVisuals(version.status);
                    const features = parseFeatures(version.description);

                    return (
                        <div
                            key={version.version_id}
                            className="relative p-8 rounded-2xl text-center shadow-lg transition-transform hover:scale-105 border border-primary bg-gradient-to-b from-[#000000] to-[#1A1A1A]"
                        >
                            {/* Image */}
                            <div className="flex justify-center">
                                <Image
                                    src={version.image}
                                    alt={`${version.version_name} image`}
                                    width={240}
                                    height={208}
                                    className="h-52 w-60 object-contain"
                                />
                            </div>

                            {/* Dynamic badge */}
                            <div className="flex justify-start mt-4">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-md ${visuals.badgeColor}`}>
                                    {visuals.badgeIcon} {visuals.badgeText}
                                </span>
                            </div>

                            {/* Version Info */}
                            <div className="flex justify-between items-center mt-4">
                                <h3 className="text-2xl font-bold text-primary">
                                    {version.version_name}
                                </h3>
                                <p className="text-white/90 text-sm font-semibold">
                                    {new Date(version.release_date).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>

                            {version.title && (
                                <p className="text-left text-white/90 text-sm mt-1 font-semibold">
                                    {version.title}
                                </p>
                            )}

                            {/* Features List */}
                            <ul className="mt-3 text-left text-sm text-white/80 list-disc ml-4 space-y-1">
                                {features.map((feature, index) => (
                                    <li key={index}>{feature}</li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default VersionCard;
