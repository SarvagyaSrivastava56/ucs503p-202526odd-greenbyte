import MainLayout from '@/components/main-layout';

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="p-8">
        <h1 className="font-headline text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage your account settings.</p>
      </div>
    </MainLayout>
  );
}
