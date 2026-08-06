import HomeHero from '../../components/QuickLinks/HomeHero';
import HomeStats from '../../components/QuickLinks/HomeStats';
import HMSIntegrationAnimation from '../../components/QuickLinks/HMSIntegrationAnimation';
import HomePracticeAreas from '../../components/QuickLinks/HomePracticeAreas';
import HomeHealthPackages from '../../components/QuickLinks/HomeHealthPackages';
import HomeTestimonials from '../../components/QuickLinks/HomeTestimonials';
// import PublicFeedbackForm from '../components/PublicFeedbackFor';
import PublicFeedbackForm from "../../components/portal/PublicFeedbackForm";
import HomeFAQ from '../../components/QuickLinks/HomeFAQ';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* 1. Hero Banner */}
      <HomeHero />

      {/* 2. Key Stats Bar */}
      <HomeStats />

      {/* 3. Deep HMS Integration Animation */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <HMSIntegrationAnimation />
      </section>

      {/* 4. Specialization Practice Areas */}
      <HomePracticeAreas />

      {/* 5. Health Packages & Video Showcase */}
      <HomeHealthPackages />

      {/* 6. Patient Reviews */}
      <HomeTestimonials />
   

      {/* 7. Frequently Asked Questions */}
      <HomeFAQ />

      {/* 7. Patient Reviews */}
      <PublicFeedbackForm />
    </div>
  );
}
