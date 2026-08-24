import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import Background from '../components/Background';
import HeroSection from '../components/landing/HeroSection';
import StatsStrip from '../components/landing/StatsStrip';
import WhyAttendX from '../components/landing/WhyAttendX';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import RolePreviewSection from '../components/landing/RolePreviewSection';
import FinalCtaSection from '../components/landing/FinalCtaSection';
export default function Landing({ onNavigate }){
  return (
    <div className="lp-page">
      <div className="lp-hero-shell">
        <Background />
        <div className="lp-orbit lp-orbit-a" />
        <div className="lp-orbit lp-orbit-b" />
        <div className="lp-glow lp-glow-a" />
        <div className="lp-glow lp-glow-b" />

      <NavBar onNavigate={onNavigate} />
        <HeroSection onNavigate={onNavigate} />
      </div>

      <StatsStrip />
      <WhyAttendX />
      <HowItWorksSection />
      <RolePreviewSection onNavigate={onNavigate} />
      <FinalCtaSection onNavigate={onNavigate} />

      <Footer />
    </div>
  );
}
