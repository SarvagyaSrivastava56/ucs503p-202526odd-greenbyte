import MainLayout from '@/components/main-layout';

export default function ProfilePage() {
  return (
    <MainLayout>
      <div className="p-8">
        <h1 className="font-headline text-3xl font-bold">Profile</h1>
        <p className="mt-2 text-muted-foreground">Your user profile.</p>
      </div>
    </MainLayout>
  );
}
