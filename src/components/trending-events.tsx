'use client';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { EventCard } from "./event-card";
import { getTrendingEvents } from "@/lib/firebase-queries";
import { useEffect, useState } from "react";
import type { Event } from "@/lib/types";
import { EventCardSkeleton } from "./event-card-skeleton";

export default function TrendingEvents() {
    const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const events = await getTrendingEvents(6);
                setTrendingEvents(events);
            } catch (error) {
                console.error('Error fetching trending events:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrending();
    }, []);

    if (loading) {
        return (
            <div className="mb-12">
                <h2 className="font-headline text-2xl font-semibold mb-4">Trending Events</h2>
                <Carousel opts={{ align: "start", loop: true }}>
                    <CarouselContent className="-ml-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <CarouselItem key={i} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                <EventCardSkeleton />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        );
    }

    if (trendingEvents.length === 0) {
        return null;
    }

    return (
        <div className="mb-12">
            <h2 className="font-headline text-2xl font-semibold mb-4">Trending Events</h2>
            <Carousel opts={{
                align: "start",
                loop: true,
            }}>
                <CarouselContent className="-ml-4">
                    {trendingEvents.map((event) => (
                        <CarouselItem key={event.id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                            <EventCard event={event} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
            </Carousel>
        </div>
    )
}
