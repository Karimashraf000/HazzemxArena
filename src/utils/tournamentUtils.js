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

// Generate initial tournament bracket from songs
export const generateBracket = (songs, size = 32) => {
    if (songs.length !== size) {
        throw new Error(`Tournament requires exactly ${size} songs`);
    }

    const shuffledSongs = shuffleArray(songs);
    const rounds = [];
    let matchIdCounter = 0;

    // Helper to create a match
    const createMatch = (roundName, roundNum, matchNum, s1, s2) => ({
        id: `match-${matchIdCounter++}`,
        round: roundName,
        roundNumber: roundNum,
        matchNumber: matchNum,
        song1: s1 || null,
        song2: s2 || null,
        winner: null,
        votes: { song1: 0, song2: 0 }
    });

    let currentRoundSongs = shuffledSongs;
    let roundNum = 1;

    // 1. First Round (Populated with songs)
    const firstRoundMatches = [];
    const firstRoundMatchCount = size / 2;
    const firstRoundName = size === 32 ? 'Round of 32' : size === 16 ? 'Round of 16' : 'Quarter Finals';

    for (let i = 0; i < size; i += 2) {
        firstRoundMatches.push(createMatch(firstRoundName, roundNum, (i / 2) + 1, currentRoundSongs[i], currentRoundSongs[i + 1]));
    }
    rounds.push(firstRoundMatches);
    roundNum++;

    // 2. Subsequent Rounds (Placeholders)
    let matchCount = firstRoundMatchCount / 2;
    while (matchCount >= 1) {
        const roundMatches = [];
        let roundName = '';
        if (matchCount === 8) roundName = 'Round of 16';
        else if (matchCount === 4) roundName = 'Quarter Finals';
        else if (matchCount === 2) roundName = 'Semi Finals';
        else if (matchCount === 1) roundName = 'Final';

        for (let i = 0; i < matchCount; i++) {
            roundMatches.push(createMatch(roundName, roundNum, i + 1, null, null));
        }
        rounds.push(roundMatches);
        matchCount /= 2;
        roundNum++;
    }

    // Flatten matches for easy lookup
    const allMatches = rounds.flat();

    const result = {
        allMatches,
        rounds,
        final: rounds[rounds.length - 1]
    };

    if (size === 32) {
        result.roundOf32 = rounds[0];
        result.roundOf16 = rounds[1];
        result.quarterFinals = rounds[2];
        result.semiFinals = rounds[3];
    } else if (size === 16) {
        result.roundOf16 = rounds[0];
        result.quarterFinals = rounds[1];
        result.semiFinals = rounds[2];
    } else if (size === 8) {
        result.quarterFinals = rounds[0];
        result.semiFinals = rounds[1];
    }

    return result;
};

// Advance winner to next round
const advanceWinner = (matches, completedMatch) => {
    const { id, roundNumber, matchNumber, winner } = completedMatch;

    // Find max round number to know if it's final
    const maxRound = Math.max(...matches.map(m => m.roundNumber));

    if (roundNumber === maxRound) {
        return matches; // Tournament complete
    }

    // Calculate next match index
    const nextRoundNumber = roundNumber + 1;
    const nextMatchNumber = Math.ceil(matchNumber / 2);
    const isFirstSlot = matchNumber % 2 !== 0;

    const nextMatchIndex = matches.findIndex(m => m.roundNumber === nextRoundNumber && m.matchNumber === nextMatchNumber);

    if (nextMatchIndex === -1) {
        console.error('Could not find next match', { roundNumber, nextRoundNumber, matchNumber, nextMatchNumber });
        return matches;
    }

    const updatedMatches = [...matches];
    const nextMatch = { ...updatedMatches[nextMatchIndex] };

    if (isFirstSlot) {
        nextMatch.song1 = winner;
    } else {
        nextMatch.song2 = winner;
    }

    updatedMatches[nextMatchIndex] = nextMatch;
    return updatedMatches;
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
    const updatedBracketMatches = advanceWinner(updatedMatches, match);

    // Reconstruct rounds structure from updated matches
    const rounds = [];
    const maxRound = Math.max(...updatedBracketMatches.map(m => m.roundNumber));
    for (let i = 1; i <= maxRound; i++) {
        rounds.push(updatedBracketMatches.filter(m => m.roundNumber === i));
    }

    const result = {
        ...bracket,
        allMatches: updatedBracketMatches,
        rounds,
        final: rounds[rounds.length - 1]
    };

    // Backward compatibility
    if (updatedBracketMatches.length === 31) { // Size 32
        result.roundOf32 = rounds[0];
        result.roundOf16 = rounds[1];
        result.quarterFinals = rounds[2];
        result.semiFinals = rounds[3];
    } else if (updatedBracketMatches.length === 15) { // Size 16
        result.roundOf16 = rounds[0];
        result.quarterFinals = rounds[1];
        result.semiFinals = rounds[2];
    } else if (updatedBracketMatches.length === 7) { // Size 8
        result.quarterFinals = rounds[0];
        result.semiFinals = rounds[1];
    }
    return result;
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
        // Extreme Optimization: Store only essential fields
        // n: name, m: image (media), i: id
        const itemsData = tournament.songs.map(s => ({
            n: s.name || s.title,
            m: s.image || s.thumbnail,
            i: s.id
        }));

        // Create a vote string: 0=no winner, 1=song1, 2=song2
        const votes = tournament.bracket.allMatches.map(m => {
            if (!m.winner) return '0';
            return m.winner.id === m.song1.id ? '1' : '2';
        }).join('');

        const payload = {
            s: itemsData,
            v: votes,
            id: tournament.id ? tournament.id.replace('tournament-', '') : Date.now().toString(),
            sz: tournament.size // Store size explicitly
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

        // Reconstruct item objects
        const songs = payload.s.map(d => ({
            id: d.i,
            name: d.n,
            title: d.n, // Backward compat
            image: d.m,
            thumbnail: d.m, // Backward compat
            // Add dummy values for other fields if needed to prevent crashes
            platform: 'generic',
            url: '',
            embedUrl: ''
        }));

        // Use stored size or infer
        let size = payload.sz || 32;
        if (!payload.sz) {
            if (songs.length <= 8) size = 8;
            else if (songs.length <= 16) size = 16;
        }

        const bracket = generateBracket(songs, size);

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