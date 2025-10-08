import { getTrendingEvents } from "@/ai/flows/trending-events-display";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { mockEvents } from "@/lib/mock-data";
import { EventCard } from "./event-card";

export default async function TrendingEvents() {
    const trendingEventsData = await getTrendingEvents();

    const trendingEvents = mockEvents.filter(e => trendingEventsData.some(t => t.eventId === e.id)).map(e => ({...e, isTrending: true}));
    
    if (!trendingEvents.length) {
        // Fallback to first few mock events if AI fails or returns empty
        trendingEvents.push(...mockEvents.slice(0, 4).map(e => ({...e, isTrending: true})));
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
