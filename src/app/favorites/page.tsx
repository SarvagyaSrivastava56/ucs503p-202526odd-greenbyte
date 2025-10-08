import MainLayout from '@/components/main-layout';

export default function FavoritesPage() {
  return (
    <MainLayout>
      <div className="p-8">
        <h1 className="font-headline text-3xl font-bold">Favorites</h1>
        <p className="mt-2 text-muted-foreground">Your favorite events.</p>
      </div>
    </MainLayout>
  );
}
