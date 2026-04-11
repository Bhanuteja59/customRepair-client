import { Hero }             from './components/sections/Hero';
import { Services }         from './components/sections/Services';
import { HowItWorks }       from './components/sections/HowItWorks';
import { TrustSignals }     from './components/sections/TrustSignals';
import { Reviews }          from './components/sections/Reviews';
import { ConversionBanner } from './components/sections/ConversionBanner';

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <HowItWorks />
      <TrustSignals />
      <Reviews />
      <ConversionBanner />
    </>
  );
}
