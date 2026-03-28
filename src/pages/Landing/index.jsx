import React, { useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import PainPoints from './components/PainPoints';
import Transformation from './components/Transformation';
import Benefits from './components/Benefits';
import Features from './components/Features';
import Niche from './components/Niche';
import VisualProof from './components/VisualProof';
import Comparison from './components/Comparison';
import Pricing from './components/Pricing';
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
                <PainPoints />
                <Transformation />
                <Benefits />
                <Features />
                <Niche />
                <VisualProof />
                <Comparison />
                <Pricing />
                <Testimonials />
                <FAQ />
                <FinalCTA />
            </main>
            <Footer />
        </div>
    );
}
