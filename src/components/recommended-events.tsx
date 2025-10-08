import { getPersonalizedEventRecommendations } from "@/ai/flows/personalized-event-recommendations";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { mockEvents } from "@/lib/mock-data";
import { EventCard } from "./event-card";

export default async function RecommendedEvents() {
  const recommendationsData = await getPersonalizedEventRecommendations({
    userRsvpEvents: ['event-1'],
    userFavoriteEvents: ['event-2'],
  });

  let recommendedEvents = mockEvents.filter(e => recommendationsData.recommendedEvents.includes(e.id));
  
  if (!recommendedEvents.length) {
    // Fallback if AI fails or returns no results
    recommendedEvents = mockEvents.slice(4, 8);
  }

  return (
    <div className="mb-12">
      <h2 className="font-headline text-2xl font-semibold mb-4">Recommended For You</h2>
      <Carousel opts={{ align: "start" }}>
        <CarouselContent className="-ml-4">
          {recommendedEvents.map((event) => (
            <CarouselItem key={event.id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <EventCard event={event} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
}
