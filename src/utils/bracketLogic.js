/**
 * Bracket Logic Utilities
 * Handles tournament seeding, matchup generation, and progression
 */

/**
 * Shuffle array using Fisher-Yates algorithm for random seeding
 */
export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Generate initial bracket structure from participants
 * @param {Array} participants - Array of participant objects
 * @returns {Object} - Bracket structure with rounds and matches
 */
export function generateBracket(participants) {
    const shuffled = shuffleArray(participants);
    const totalRounds = Math.log2(shuffled.length);

    if (!Number.isInteger(totalRounds)) {
        throw new Error('Participant count must be a power of 2 (8, 16, or 32)');
    }

    const rounds = [];

    // Generate first round matchups
    const firstRound = [];
    for (let i = 0; i < shuffled.length; i += 2) {
        firstRound.push({
            id: `r1-m${i / 2}`,
            round: 1,
            matchIndex: i / 2,
            participant1: shuffled[i],
            participant2: shuffled[i + 1],
            winner: null,
            completed: false,
        });
    }
    rounds.push(firstRound);

    // Generate placeholder matches for subsequent rounds
    let previousRoundMatches = firstRound.length;
    for (let round = 2; round <= totalRounds; round++) {
        const roundMatches = [];
        const matchCount = previousRoundMatches / 2;

        for (let i = 0; i < matchCount; i++) {
            roundMatches.push({
                id: `r${round}-m${i}`,
                round,
                matchIndex: i,
                participant1: null,
                participant2: null,
                winner: null,
                completed: false,
            });
        }
        rounds.push(roundMatches);
        previousRoundMatches = matchCount;
    }

    return {
        rounds,
        totalRounds,
        currentRound: 1,
        currentMatchIndex: 0,
        champion: null,
    };
}

/**
 * Get the current match to be played
 */
export function getCurrentMatch(bracket) {
    const { rounds, currentRound, currentMatchIndex } = bracket;

    if (currentRound > rounds.length) {
        return null; // Tournament complete
    }

    const round = rounds[currentRound - 1];
    return round[currentMatchIndex] || null;
}

/**
 * Advance winner to next round
 */
export function advanceWinner(bracket, matchId, winnerId) {
    const newBracket = JSON.parse(JSON.stringify(bracket));

    // Find and update the current match
    let matchFound = false;
    let matchRound = 0;
    let matchIndex = 0;

    for (let r = 0; r < newBracket.rounds.length; r++) {
        for (let m = 0; m < newBracket.rounds[r].length; m++) {
            if (newBracket.rounds[r][m].id === matchId) {
                const match = newBracket.rounds[r][m];
                match.winner = winnerId;
                match.completed = true;
                matchFound = true;
                matchRound = r;
                matchIndex = m;
                break;
            }
        }
        if (matchFound) break;
    }

    if (!matchFound) {
        throw new Error('Match not found');
    }

    // Get winner participant object
    const currentMatch = newBracket.rounds[matchRound][matchIndex];
    const winnerParticipant = currentMatch.participant1?.id === winnerId
        ? currentMatch.participant1
        : currentMatch.participant2;

    // Check if this was the final match
    if (matchRound === newBracket.rounds.length - 1) {
        newBracket.champion = winnerParticipant;
        newBracket.currentRound = newBracket.totalRounds + 1;
        return newBracket;
    }

    // Advance winner to next round
    const nextRound = matchRound + 1;
    const nextMatchIndex = Math.floor(matchIndex / 2);
    const nextMatch = newBracket.rounds[nextRound][nextMatchIndex];

    // Place winner in appropriate slot (first or second participant)
    if (matchIndex % 2 === 0) {
        nextMatch.participant1 = winnerParticipant;
    } else {
        nextMatch.participant2 = winnerParticipant;
    }

    // Move to next incomplete match
    const { nextRoundIndex, nextIncompleteIndex } = findNextMatch(newBracket);
    newBracket.currentRound = nextRoundIndex + 1;
    newBracket.currentMatchIndex = nextIncompleteIndex;

    return newBracket;
}

/**
 * Find the next incomplete match
 */
function findNextMatch(bracket) {
    for (let r = 0; r < bracket.rounds.length; r++) {
        for (let m = 0; m < bracket.rounds[r].length; m++) {
            const match = bracket.rounds[r][m];
            if (!match.completed && match.participant1 && match.participant2) {
                return { nextRoundIndex: r, nextIncompleteIndex: m };
            }
        }
    }
    return { nextRoundIndex: bracket.totalRounds, nextIncompleteIndex: 0 };
}

/**
 * Get round name based on remaining participants
 */
export function getRoundName(roundNumber, totalRounds) {
    const remainingMatches = Math.pow(2, totalRounds - roundNumber);

    if (remainingMatches === 1) return 'FINAL';
    if (remainingMatches === 2) return 'SEMI-FINALS';
    if (remainingMatches === 4) return 'QUARTER-FINALS';
    return `ROUND OF ${remainingMatches * 2}`;
}

/**
 * Calculate tournament progress percentage
 */
export function getProgress(bracket) {
    const totalMatches = bracket.rounds.reduce((acc, round) => acc + round.length, 0);
    const completedMatches = bracket.rounds.reduce((acc, round) =>
        acc + round.filter(m => m.completed).length, 0
    );
    return Math.round((completedMatches / totalMatches) * 100);
}
