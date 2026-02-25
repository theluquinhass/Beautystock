import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const OnboardingContext = createContext();

export function OnboardingProvider({ children }) {
    const { user } = useAuth();

    const [step, setStep] = useState(0);
    const [isOnboardingActive, setIsOnboardingActive] = useState(false);
    const [isCompleted, setIsCompleted] = useState(true);

    // Initialize onboarding state
    useEffect(() => {
        if (!user) return;

        const checkOnboardingStatus = async () => {
            const completed = localStorage.getItem(`beautystock_onboarding_${user.id}`);

            if (completed) {
                setIsCompleted(true);
                setIsOnboardingActive(false);
                return;
            }

            const { count: productCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            const { count: movementCount } = await supabase
                .from('movements')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            if (productCount === 0 && movementCount === 0) {
                setIsCompleted(false);
                setIsOnboardingActive(true);
                setStep(1);
            } else {
                finishOnboarding();
            }
        };

        checkOnboardingStatus();
    }, [user]);

    // Track state changes to auto-advance
    useEffect(() => {
        if (!isOnboardingActive || !user) return;

        let interval;

        const checkProgress = async () => {
            if (step === 2) {
                const { count } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                if (count > 0) {
                    setTimeout(() => setStep(3), 800);
                }
            } else if (step === 3) {
                const { count } = await supabase
                    .from('movements')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                if (count > 0) {
                    setTimeout(() => setStep(4), 800);
                }
            }
        };

        if (step === 2 || step === 3) {
            interval = setInterval(checkProgress, 2000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [step, isOnboardingActive, user]);

    const nextStep = () => {
        setStep(prev => prev + 1);
    };

    const prevStep = () => {
        setStep(prev => Math.max(1, prev - 1));
    };

    const finishOnboarding = () => {
        if (user) {
            localStorage.setItem(`beautystock_onboarding_${user.id}`, 'true');
        }
        setIsCompleted(true);
        setIsOnboardingActive(false);
        setStep(0);
    };

    const skipOnboarding = () => {
        finishOnboarding();
    };

    return (
        <OnboardingContext.Provider value={{
            step,
            setStep,
            isOnboardingActive,
            isCompleted,
            nextStep,
            prevStep,
            finishOnboarding,
            skipOnboarding
        }}>
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    return useContext(OnboardingContext);
}
