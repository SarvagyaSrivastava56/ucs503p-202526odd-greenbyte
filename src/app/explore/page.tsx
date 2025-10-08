import MainLayout from '@/components/main-layout';

export default function ExplorePage() {
  return (
    <MainLayout>
      <div className="p-8">
        <h1 className="font-headline text-3xl font-bold">Explore Events</h1>
        <p className="mt-2 text-muted-foreground">Discover what's happening on campus.</p>
      </div>
    </MainLayout>
  );
}
