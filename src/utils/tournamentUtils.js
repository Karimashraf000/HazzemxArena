import LZString from 'lz-string';

// Shuffle array using Fisher-Yates algorithm
export const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// Generate initial tournament bracket from 32 songs
export const generateBracket = (songs, shuffle = true) => {
    if (songs.length !== 32) {
        throw new Error('Tournament requires exactly 32 songs');
    }

    const shuffledSongs = shuffle ? shuffleArray(songs) : [...songs];

    // Create Round of 32 matchups
    const roundOf32 = [];
    for (let i = 0; i < 32; i += 2) {
        roundOf32.push({
            id: `r32-${i / 2}`,
            round: 'Round of 32',
            roundNumber: 1,
            matchNumber: i / 2 + 1,
            song1: shuffledSongs[i],
            song2: shuffledSongs[i + 1],
            winner: null,
            votes: { song1: 0, song2: 0 }
        });
    }

    // Create placeholders for subsequent rounds
    const roundOf16 = Array(8).fill(null).map((_, i) => ({
        id: `r16-${i}`,
        round: 'Round of 16',
        roundNumber: 2,
        matchNumber: i + 1,
        song1: null,
        song2: null,
        winner: null,
        votes: { song1: 0, song2: 0 }
    }));

    const quarterFinals = Array(4).fill(null).map((_, i) => ({
        id: `qf-${i}`,
        round: 'Quarter Final',
        roundNumber: 3,
        matchNumber: i + 1,
        song1: null,
        song2: null,
        winner: null,
        votes: { song1: 0, song2: 0 }
    }));

    const semiFinals = Array(2).fill(null).map((_, i) => ({
        id: `sf-${i}`,
        round: 'Semi Final',
        roundNumber: 4,
        matchNumber: i + 1,
        song1: null,
        song2: null,
        winner: null,
        votes: { song1: 0, song2: 0 }
    }));

    const final = [{
        id: 'final',
        round: 'Final',
        roundNumber: 5,
        matchNumber: 1,
        song1: null,
        song2: null,
        winner: null,
        votes: { song1: 0, song2: 0 }
    }];

    return {
        roundOf32,
        roundOf16,
        quarterFinals,
        semiFinals,
        final,
        allMatches: [...roundOf32, ...roundOf16, ...quarterFinals, ...semiFinals, ...final]
    };
};

// Get current battle (first unfinished match)
export const getCurrentBattle = (bracket) => {
    return bracket.allMatches.find(match =>
        match.song1 && match.song2 && !match.winner
    );
};

// Get next battle after current
export const getNextBattle = (bracket, currentBattleId) => {
    const currentIndex = bracket.allMatches.findIndex(m => m.id === currentBattleId);
    if (currentIndex === -1) return null;

    for (let i = currentIndex + 1; i < bracket.allMatches.length; i++) {
        const match = bracket.allMatches[i];
        if (match.song1 && match.song2 && !match.winner) {
            return match;
        }
    }
    return null;
};

// Record a vote and update bracket
export const recordVote = (bracket, battleId, winner) => {
    const matchIndex = bracket.allMatches.findIndex(m => m.id === battleId);
    if (matchIndex === -1) return bracket;

    const updatedMatches = [...bracket.allMatches];
    const match = { ...updatedMatches[matchIndex] };

    // Set winner
    match.winner = winner;

    // Update vote count
    if (winner === match.song1) {
        match.votes.song1++;
    } else {
        match.votes.song2++;
    }

    updatedMatches[matchIndex] = match;

    // Advance winner to next round
    const updatedBracket = advanceWinner(updatedMatches, match);

    return {
        ...bracket,
        allMatches: updatedBracket,
        roundOf32: updatedBracket.slice(0, 16),
        roundOf16: updatedBracket.slice(16, 24),
        quarterFinals: updatedBracket.slice(24, 28),
        semiFinals: updatedBracket.slice(28, 30),
        final: [updatedBracket[30]]
    };
};

// Advance winner to next round
const advanceWinner = (matches, completedMatch) => {
    const { id, roundNumber, matchNumber, winner } = completedMatch;

    if (roundNumber === 5) {
        // Final match, tournament complete
        return matches;
    }

    // Calculate which match in next round
    const nextRoundMatchIndex = Math.floor((matchNumber - 1) / 2);
    const isFirstSlot = (matchNumber - 1) % 2 === 0;

    // Find the next round match
    const nextRoundStartIndex = {
        1: 16, // Round of 32 -> Round of 16
        2: 24, // Round of 16 -> Quarter Finals
        3: 28, // Quarter Finals -> Semi Finals
        4: 30  // Semi Finals -> Final
    }[roundNumber];

    const nextMatchIndex = nextRoundStartIndex + nextRoundMatchIndex;
    const updatedMatches = [...matches];
    const nextMatch = { ...updatedMatches[nextMatchIndex] };

    // Place winner in appropriate slot
    if (isFirstSlot) {
        nextMatch.song1 = winner;
    } else {
        nextMatch.song2 = winner;
    }

    updatedMatches[nextMatchIndex] = nextMatch;

    return updatedMatches;
};

// Get tournament progress
export const getTournamentProgress = (bracket) => {
    const completed = bracket.allMatches.filter(m => m.winner).length;
    const total = bracket.allMatches.filter(m => m.song1 && m.song2).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return {
        completed,
        total,
        percentage: Math.round(percentage),
        isComplete: completed === total
    };
};

// Encode tournament to URL param
export const encodeTournament = (tournament) => {
    try {
        // Extreme Optimization: Store only essential fields with short keys
        // p: platform (y/s), i: songId, t: truncated title
        const songsData = tournament.songs.map(s => ({
            p: s.platform === 'youtube' ? 'y' : 's',
            i: s.songId,
            t: s.title.substring(0, 30) // Truncate title to save space
        }));

        // Create a vote string: 0=no winner, 1=song1, 2=song2
        const votes = tournament.bracket.allMatches.map(m => {
            if (!m.winner) return '0';
            return m.winner.id === m.song1.id ? '1' : '2';
        }).join('');

        const payload = {
            s: songsData,
            v: votes,
            id: tournament.id ? tournament.id.replace('tournament-', '') : Date.now().toString()
        };

        const json = JSON.stringify(payload);
        return LZString.compressToEncodedURIComponent(json);
    } catch (error) {
        console.error('Error encoding tournament:', error);
        return null;
    }
};

// Decode tournament from URL param
export const decodeTournament = (encoded) => {
    try {
        const json = LZString.decompressFromEncodedURIComponent(encoded);
        if (!json) return null;

        const payload = JSON.parse(json);

        // Reconstruct full song objects
        const songs = payload.s.map(d => {
            const platform = d.p === 'y' ? 'youtube' : 'spotify';
            const songId = d.i;
            const title = d.t;

            return {
                id: `${platform}-${songId}-${Date.now()}`,
                platform,
                songId,
                title,
                url: platform === 'youtube'
                    ? `https://www.youtube.com/watch?v=${songId}`
                    : `https://open.spotify.com/track/${songId}`,
                embedUrl: platform === 'youtube'
                    ? `https://www.youtube.com/embed/${songId}`
                    : `https://open.spotify.com/embed/track/${songId}`,
                thumbnail: platform === 'youtube'
                    ? `https://img.youtube.com/vi/${songId}/hqdefault.jpg`
                    : null,
                artist: 'Unknown Artist'
            };
        });

        // Generate bracket (without shuffling to preserve order)
        const bracket = generateBracket(songs, false);

        // Replay votes
        const votes = payload.v.split('');
        let currentBracket = bracket;

        votes.forEach((vote, index) => {
            if (vote === '0') return;

            const match = currentBracket.allMatches[index];
            if (match && match.song1 && match.song2) {
                const winner = vote === '1' ? match.song1 : match.song2;
                currentBracket = recordVote(currentBracket, match.id, winner);
            }
        });

        return {
            id: `tournament-${payload.id}`,
            songs,
            bracket: currentBracket
        };
    } catch (error) {
        console.error('Error decoding tournament:', error);
        return null;
    }
};
