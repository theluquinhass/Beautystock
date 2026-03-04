import React, { useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import SocialProof from './components/SocialProof';
import PainPoints from './components/PainPoints';
import HowItWorks from './components/HowItWorks';
import InteractiveDemo from './components/InteractiveDemo';
import Benefits from './components/Benefits';
import Results from './components/Results';
import Pricing from './components/Pricing';
import Guarantee from './components/Guarantee';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';

export default function Landing() {
    // Configuração básica para scroll suave ao clicar em links âncora
    useEffect(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
        };
    }, []);

    return (
        <div className="bg-[#fdf2f8] min-h-screen font-sans selection:bg-pink-100 selection:text-pink-900 text-gray-900 overflow-x-hidden">
            <Header />
            <main>
                <Hero />
                <SocialProof />
                <PainPoints />
                <HowItWorks />
                <InteractiveDemo />
                <Benefits />
                <Results />
                <Pricing />
                <Guarantee />
                <Testimonials />
                <FAQ />
                <FinalCTA />
            </main>
            <Footer />
        </div>
    );
}
