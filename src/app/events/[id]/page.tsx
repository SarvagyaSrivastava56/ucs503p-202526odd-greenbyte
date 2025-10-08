import MainLayout from '@/components/main-layout';
import EventDetailContent from '@/components/event-detail-content';

export default function EventDetailPage({ params }: { params: { id: string } }) {
  return (
    <MainLayout>
      <EventDetailContent id={params.id} />
    </MainLayout>
  );
}
