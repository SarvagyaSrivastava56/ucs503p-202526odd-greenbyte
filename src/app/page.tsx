
import MainLayout from '@/components/main-layout';
import DashboardContent from '@/components/dashboard-content';
import RecommendedEvents from '@/components/recommended-events';
import TrendingEvents from '@/components/trending-events';

export default function Home() {
  return (
    <MainLayout>
      <DashboardContent 
        trendingEvents={<TrendingEvents />}
        recommendedEvents={<RecommendedEvents />}
      />
    </MainLayout>
  );
}
