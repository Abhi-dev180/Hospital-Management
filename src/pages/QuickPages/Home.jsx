import HomeHero from '../../components/QuickLinks/HomeHero';
import HomeStats from '../../components/QuickLinks/HomeStats';
import HomeDoctorsCarousel from '../../components/QuickLinks/HomeDoctorsCarousel';
import HMSIntegrationAnimation from '../../components/QuickLinks/HMSIntegrationAnimation';
import HomePracticeAreas from '../../components/QuickLinks/HomePracticeAreas';
import HomeHospitalLocator from '../../components/QuickLinks/HomeHospitalLocator';
import HomeLabCatalogue from '../../components/QuickLinks/HomeLabCatalogue';
import HomeHealthPackages from '../../components/QuickLinks/HomeHealthPackages';
import HomeTestimonials from '../../components/QuickLinks/HomeTestimonials';
import PublicFeedbackForm from '../../components/portal/PublicFeedbackForm';
import HomeFAQ from '../../components/QuickLinks/HomeFAQ';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* 1. Hero Banner */}
      <HomeHero />

      {/* 2. Key Stats Bar */}
      <HomeStats />

      {/* 3. Top Specialist Doctors Carousel */}
      <HomeDoctorsCarousel />

      {/* 4. Deep HMS Integration Animation */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <HMSIntegrationAnimation />
      </section>

      {/* 5. Specialization Practice Areas */}
      <HomePracticeAreas />

      {/* 6. Interactive Hospital Network Locator & City Filter */}
      <HomeHospitalLocator />

      {/* 7. Diagnostic Lab Tests Catalogue with Original vs Discounted Pricing */}
      <HomeLabCatalogue />

      {/* 7. Health Packages & Video Showcase */}
      <HomeHealthPackages />

      {/* 8. Patient Reviews */}
      <HomeTestimonials />

      {/* 9. Frequently Asked Questions */}
      <HomeFAQ />

      {/* 10. Public Feedback Form */}
      <PublicFeedbackForm />
    </div>
  );
}
