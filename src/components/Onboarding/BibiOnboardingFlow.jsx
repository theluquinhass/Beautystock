import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import SpotlightOverlay from './SpotlightOverlay';

export default function BibiOnboardingFlow() {
    const { step, isOnboardingActive, nextStep, finishOnboarding } = useOnboarding();

    if (!isOnboardingActive || step === 0) return null;

    switch (step) {
        case 1:
            return (
                <SpotlightOverlay
                    isModal
                    title="Oi! Sou a Bibi ✨"
                    text="Sou sua Consultora de Estoque. Vi que seu negócio é novo por aqui. Vamos cadastrar seu primeiro produto?"
                    onNext={nextStep}
                />
            );
        case 2:
            return (
                <SpotlightOverlay
                    targetSelector="[data-onboarding='add-product']"
                    title="Seu primeiro produto"
                    text="Clique aqui para cadastrar o que você vende. Pode ser um perfume, hidratante, maquiagem..."
                    onNext={() => {
                        // User should click the button instead, but if they click next we wait for them to act.
                    }}
                />
            );
        case 3:
            return (
                <SpotlightOverlay
                    targetSelector="[data-onboarding='add-movement']"
                    title="Ótimo trabalho! 👏"
                    text="Agora registre uma venda ou uma entrada desse produto no seu estoque clicando aqui."
                    onNext={() => { }} // User needs to perform action
                />
            );
        case 4:
            return (
                <SpotlightOverlay
                    targetSelector="[data-onboarding='profit-card']"
                    title="Onde a mágica acontece 💸"
                    text="Aqui eu acompanharei de perto todo o lucro que você gerar e os riscos de perder dinheiro."
                    onNext={nextStep}
                />
            );
        case 5:
            return (
                <SpotlightOverlay
                    isModal
                    isLast
                    title="Você está pronto!"
                    text="Siga alimentando o app todos os dias. Quando estiver pronto para crescer rápido, desbloqueie meu modo PRO para Dicas Exclusivas de Compra Pelo WhatsApp!"
                    onNext={finishOnboarding}
                />
            );
        default:
            return null;
    }
}
