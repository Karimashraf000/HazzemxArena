import { useState, useEffect, useCallback } from 'react';
import { generateBracket, advanceWinner, getCurrentMatch, getRoundName, getProgress } from '../utils/bracketLogic';

const STORAGE_KEY = 'versus-arena-tournament';

/**
 * Custom hook for managing tournament state
 * Handles initialization, voting, progression, and persistence
 */
export function useTournament() {
    const [tournament, setTournament] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setTournament(parsed);
            }
        } catch (error) {
            console.error('Failed to load tournament:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save to localStorage when tournament changes
    useEffect(() => {
        if (tournament) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(tournament));
            } catch (error) {
                console.error('Failed to save tournament:', error);
            }
        }
    }, [tournament]);

    /**
     * Initialize a new tournament
     * @param {Object} options - Tournament options
     * @param {Array} options.participants - Array of participant objects
     * @param {string} options.category - Category name
     * @param {string} options.type - 'songs' or 'images'
     */
    const initializeTournament = useCallback((options) => {
        const { participants, category, type } = options;

        if (![8, 16, 32].includes(participants.length)) {
            throw new Error('Tournament must have 8, 16, or 32 participants');
        }

        const bracket = generateBracket(participants);

        const newTournament = {
            ...bracket,
            category,
            type,
            startedAt: new Date().toISOString(),
            completedAt: null,
        };

        setTournament(newTournament);
        return newTournament;
    }, []);

    /**
     * Vote for a participant in the current match
     */
    const vote = useCallback((winnerId) => {
        if (!tournament) return null;

        const currentMatch = getCurrentMatch(tournament);
        if (!currentMatch) return null;

        const updatedBracket = advanceWinner(tournament, currentMatch.id, winnerId);

        // Check if tournament is complete
        if (updatedBracket.champion) {
            updatedBracket.completedAt = new Date().toISOString();
        }

        setTournament(updatedBracket);
        return updatedBracket;
    }, [tournament]);

    /**
     * Get current match details
     */
    const currentMatch = tournament ? getCurrentMatch(tournament) : null;

    /**
     * Get current round name
     */
    const roundName = tournament
        ? getRoundName(tournament.currentRound, tournament.totalRounds)
        : null;

    /**
     * Get tournament progress
     */
    const progress = tournament ? getProgress(tournament) : 0;

    /**
     * Check if tournament is complete
     */
    const isComplete = tournament?.champion != null;

    /**
     * Reset/clear tournament
     */
    const resetTournament = useCallback(() => {
        setTournament(null);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    /**
     * Get all matches for bracket view
     */
    const getAllMatches = useCallback(() => {
        if (!tournament) return [];
        return tournament.rounds;
    }, [tournament]);

    return {
        tournament,
        isLoading,
        currentMatch,
        roundName,
        progress,
        isComplete,
        champion: tournament?.champion,
        initializeTournament,
        vote,
        resetTournament,
        getAllMatches,
    };
}
