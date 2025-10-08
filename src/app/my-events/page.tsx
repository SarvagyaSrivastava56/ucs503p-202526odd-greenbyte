import MainLayout from '@/components/main-layout';

export default function MyEventsPage() {
  return (
    <MainLayout>
      <div className="p-8">
        <h1 className="font-headline text-3xl font-bold">My Events</h1>
        <p className="mt-2 text-muted-foreground">Events you have RSVPed to.</p>
      </div>
    </MainLayout>
  );
}
