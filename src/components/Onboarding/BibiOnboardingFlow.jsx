import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import SpotlightOverlay from './SpotlightOverlay';
import WelcomeSetupModal from './WelcomeSetupModal';
import { useNavigate } from 'react-router-dom';

export default function BibiOnboardingFlow() {
    const {
        status,
        tourStep,
        profileName,
        submitSetup,
        nextTourStep,
        prevTourStep,
        finishOnboarding,
        skipOnboarding
    } = useOnboarding();
    const navigate = useNavigate();

    // Do nothing until state is settled
    if (status === 'idle' || status === 'loading' || status === 'completed') {
        return null;
    }

    if (status === 'setup') {
        return <WelcomeSetupModal onSubmit={submitSetup} initialName={profileName} />;
    }

    if (status === 'tour') {
        const totalSteps = 5;

        // Force navigation if necessary to make elements visible
        const goTo = (path) => {
            if (window.location.pathname !== path) {
                navigate(path);
            }
        };

        const handleNext = (path) => {
            if (path) goTo(path);
            nextTourStep();
        };

        switch (tourStep) {
            case 1:
                return (
                    <SpotlightOverlay
                        targetSelector="[data-onboarding='nav-products']"
                        title="Seu catálogo 💄"
                        text="Aqui você cadastra tudo o que vende (perfumes, cremes...). O BeautyStock calcula seu lucro e avisa quando o estoque acabar."
                        stepIndex={1}
                        totalSteps={totalSteps}
                        onNext={() => handleNext('/dashboard')}
                        onPrev={null}
                        onSkip={skipOnboarding}
                    />
                );
            case 2:
                // Make sure we are on dashboard
                setTimeout(() => goTo('/dashboard'), 0);
                return (
                    <SpotlightOverlay
                        targetSelector="[data-onboarding='add-movement']"
                        title="Registrar Vendas 💰"
                        text="Este é o botão mágico! É aqui que você registra suas vendas ou entradas de mercadoria de forma rápida."
                        stepIndex={2}
                        totalSteps={totalSteps}
                        onNext={() => handleNext('/dashboard')}
                        onPrev={prevTourStep}
                        onSkip={skipOnboarding}
                    />
                );
            case 3:
                return (
                    <SpotlightOverlay
                        targetSelector="[data-onboarding='nav-customers']"
                        title="Carteira de Clientes 👥"
                        text="Seus clientes organizados por quem está devendo (Fiado). O plano PRO desbloqueia essa funcionalidade completa."
                        stepIndex={3}
                        totalSteps={totalSteps}
                        onNext={() => handleNext('/dashboard')}
                        onPrev={prevTourStep}
                        onSkip={skipOnboarding}
                    />
                );
            case 4:
                return (
                    <SpotlightOverlay
                        isModal
                        title="Cobranças pelo WhatsApp 📱"
                        text="No plano PRO, você pode cobrar clientes pelo WhatsApp com 1 clique! Você escolhe o tom da mensagem (Soft, Direto ou Urgente) e nós enviamos."
                        stepIndex={4}
                        totalSteps={totalSteps}
                        onNext={() => handleNext('/dashboard')}
                        onPrev={prevTourStep}
                        onSkip={skipOnboarding}
                    />
                );
            case 5:
                return (
                    <SpotlightOverlay
                        targetSelector="[data-onboarding='profit-card']"
                        title="Pronta para crescer! 🚀"
                        text={`Tudo pronto, ${profileName || 'amiga'}! Agora observe esse painel crescer todos os dias. Vamos cadastrar seu primeiro produto?`}
                        stepIndex={5}
                        totalSteps={totalSteps}
                        isLast
                        onNext={() => {
                            finishOnboarding();
                            goTo('/produtos'); // Ação de ativação após onboarding
                        }}
                        onPrev={prevTourStep}
                        onSkip={skipOnboarding}
                    />
                );
            default:
                return null;
        }
    }

    return null;
}
