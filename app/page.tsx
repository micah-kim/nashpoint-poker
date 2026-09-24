import Hero from '@/components/Hero'
import ToolsSection from '@/components/ToolsSection'
import FeatureSection from '@/components/FeatureSection'
import ComparisonSection from '@/components/ComparisonSection'
import FinalCta from '@/components/FinalCta'

export default function Home() {
  return (
    <>
      <Hero />
      <div id="tools">
        <ToolsSection />
      </div>
      <FeatureSection />
      <ComparisonSection />
      <FinalCta />
    </>
  )
}
