import MarketingHeader from './components/MarketingHeader'
import GridBackground from './components/landing/GridBackground'
import HeroSection from './components/landing/HeroSection'
import StatsSection from './components/landing/StatsSection'
import PipelineSequence from './components/landing/PipelineSequence'
import PricingSection from './components/landing/PricingSection'
import FeaturesSection from './components/landing/FeaturesSection'
import Footer from './components/landing/Footer'
import GradualBlur from './components/GradualBlur'

export default function LandingPage() {
  return (
    <>
      <MarketingHeader />
      <main style={{ background: '#0a0a0a', position: 'relative' }}>
        <GridBackground />
        <HeroSection />
        <StatsSection />
        <PipelineSequence />
        <PricingSection />
        <FeaturesSection />
        <Footer />
        <GradualBlur
          target="page"
          position="bottom"
          height="6rem"
          strength={2}
          divCount={5}
          curve="bezier"
          exponential={true}
          opacity={1}
        />
      </main>
    </>
  )
}
