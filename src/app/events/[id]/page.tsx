import MainLayout from '@/components/main-layout';
import EventDetailContent from '@/components/event-detail-content';

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <MainLayout>
      <EventDetailContent id={id} />
    </MainLayout>
  );
}
