import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { profileService } from '../services/profile.service';
import { useNavigate, useLocation } from 'react-router-dom';

const OnboardingContext = createContext();

export function OnboardingProvider({ children }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // 'idle' | 'loading' | 'setup' | 'tour' | 'completed'
    const [status, setStatus] = useState('idle');
    const [tourStep, setTourStep] = useState(1);
    const [profileName, setProfileName] = useState('');

    useEffect(() => {
        if (!user) {
            setStatus('idle');
            return;
        }

        const initOnboarding = async () => {
            const localStatus = localStorage.getItem(`beautystock_onboarding_${user.id}`);
            if (localStatus === 'true') {
                setStatus('completed');
                return;
            }

            setStatus('loading');
            try {
                const profile = await profileService.getProfile(user.id);
                setProfileName(profile.first_name || '');

                if (profile.onboarding_completed) {
                    localStorage.setItem(`beautystock_onboarding_${user.id}`, 'true');
                    setStatus('completed');
                } else if (!profile.store_niche) {
                    setStatus('setup');
                } else {
                    setTourStep(profile.onboarding_step || 1);
                    setStatus('tour');
                }
            } catch (error) {
                console.error("Error loading onboarding state:", error);
                // Fallback to complete if DB drops to avoid blocking user
                setStatus('completed');
            }
        };

        if (status === 'idle' || location.pathname === '/') {
            initOnboarding();
        }
    }, [user, location.pathname]);

    const submitSetup = async ({ name, niche, goal }) => {
        try {
            await profileService.updateOnboardingStatus(user.id, {
                store_niche: niche,
                store_goal: goal,
                onboarding_step: 1
            }, name);

            setProfileName(name);
            setTourStep(1);
            setStatus('tour');
        } catch (error) {
            console.error("Failed to submit setup:", error);
        }
    };

    const nextTourStep = () => setTourStep(prev => prev + 1);
    const prevTourStep = () => setTourStep(prev => Math.max(1, prev - 1));

    const finishOnboarding = async () => {
        try {
            await profileService.updateOnboardingStatus(user.id, {
                onboarding_completed: true,
                onboarding_step: 5
            });
            localStorage.setItem(`beautystock_onboarding_${user.id}`, 'true');
            setStatus('completed');
        } catch (error) {
            console.error("Failed to finish onboarding:", error);
            setStatus('completed');
        }
    };

    const skipOnboarding = async () => {
        await finishOnboarding();
    };

    const resetOnboarding = async () => {
        try {
            await profileService.updateOnboardingStatus(user.id, {
                store_niche: null,
                store_goal: null,
                onboarding_completed: false,
                onboarding_step: 0
            });
            localStorage.removeItem(`beautystock_onboarding_${user.id}`);
            setStatus('setup');
        } catch (error) {
            console.error("Failed to reset onboarding", error);
        }
    };

    return (
        <OnboardingContext.Provider value={{
            status,
            tourStep,
            profileName,
            submitSetup,
            nextTourStep,
            prevTourStep,
            finishOnboarding,
            skipOnboarding,
            resetOnboarding
        }}>
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    return useContext(OnboardingContext);
}
