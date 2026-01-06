import { createContext, useContext, useState, useEffect } from 'react';
import { generateBracket, recordVote as recordVoteUtil, getCurrentBattle, encodeTournament, decodeTournament } from '../utils/tournamentUtils';

const TournamentContext = createContext();

export const useTournament = () => {
    const context = useContext(TournamentContext);
    if (!context) {
        throw new Error('useTournament must be used within TournamentProvider');
    }
    return context;
};

export const TournamentProvider = ({ children }) => {
    const [songs, setSongs] = useState([]);
    const [bracket, setBracket] = useState(null);
    const [currentBattle, setCurrentBattle] = useState(null);
    const [tournamentId, setTournamentId] = useState(null);

    const [tournamentSize, setTournamentSize] = useState(32);
    const [isTransitioning, setIsTransitioning] = useState(false);



    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const encodedTournament = params.get('t');

        if (encodedTournament) {
            const decoded = decodeTournament(encodedTournament);
            if (decoded) {
                setSongs(decoded.songs || []);
                setBracket(decoded.bracket || null);
                setTournamentId(decoded.id || null);
                if (decoded.songs.length > 0) {
                    if (decoded.songs.length <= 8) setTournamentSize(8);
                    else if (decoded.songs.length <= 16) setTournamentSize(16);
                    else setTournamentSize(32);
                }
                return;
            }
        }

        // Load from localStorage if no URL param
        const saved = localStorage.getItem('currentTournament');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                setSongs(state.songs || []);
                setBracket(state.bracket || null);
                setTournamentId(state.id || null);
                setTournamentSize(state.size || 32);
            } catch (e) {
                console.error('Error loading tournament from localStorage', e);
            }
        }
    }, []);

    // Update current battle when bracket changes
    useEffect(() => {
        if (bracket) {
            const battle = getCurrentBattle(bracket);
            setCurrentBattle(battle);
        }
    }, [bracket]);

    // Add song to tournament
    const addSong = (song) => {
        if (songs.length >= tournamentSize) {
            throw new Error(`Maximum ${tournamentSize} songs allowed`);
        }
        setSongs([...songs, song]);
    };

    // Remove song from tournament
    const removeSong = (songId) => {
        setSongs(songs.filter(s => s.id !== songId));
    };

    // Clear all songs
    const clearSongs = () => {
        setSongs([]);
    };

    // Start tournament (generate bracket)
    const startTournament = (itemsOverride = null) => {
        const currentItems = itemsOverride || songs;

        if (currentItems.length !== tournamentSize) {
            throw new Error(`Need exactly ${tournamentSize} competitors to start tournament`);
        }

        const newBracket = generateBracket(currentItems, tournamentSize);
        setBracket(newBracket);

        // Generate unique tournament ID
        const id = 'tournament-' + Date.now();
        setTournamentId(id);

        // Save to localStorage
        const state = {
            id,
            songs: currentItems,
            bracket: newBracket,
            timestamp: Date.now(),
            size: tournamentSize
        };
        localStorage.setItem('currentTournament', JSON.stringify(state));

        return id;
    };

    // Fetch metadata for a list of items (URLs)
    const fetchPlaylistMetadata = async (items) => {
        const { createSongFromUrl } = await import('../utils/songUtils');
        const resolvedItems = [];

        for (const item of items) {
            if (item.url && !item.name && !item.image) {
                try {
                    const resolved = await createSongFromUrl(item.url);
                    resolvedItems.push(resolved);
                } catch (error) {
                    console.error('Failed to resolve song metadata:', item.url, error);
                    // Fallback to basic object if resolution fails
                    resolvedItems.push({
                        id: `fallback-${Date.now()}-${Math.random()}`,
                        name: 'Unknown Song',
                        image: 'https://via.placeholder.com/300',
                        url: item.url,
                        platform: 'youtube'
                    });
                }
            } else {
                resolvedItems.push(item);
            }
        }
        return resolvedItems;
    };

    // Start pre-built tournament
    const startPrebuiltTournament = async (items, size) => {
        setTournamentSize(size);

        // If items are just URLs, we need to fetch metadata
        let finalItems = items;
        if (items.length > 0 && items[0].url && !items[0].name) {
            finalItems = await fetchPlaylistMetadata(items);
        }

        setSongs(finalItems);

        // Generate bracket and ID
        const newBracket = generateBracket(finalItems, size);
        setBracket(newBracket);
        const id = 'tournament-' + Date.now();
        setTournamentId(id);

        // Save to localStorage
        const state = {
            id,
            songs: finalItems,
            bracket: newBracket,
            timestamp: Date.now(),
            size: size
        };
        localStorage.setItem('currentTournament', JSON.stringify(state));

        return id;
    };

    // Record a vote
    const recordVote = (battleId, winningSong) => {
        if (!bracket) return;

        const updatedBracket = recordVoteUtil(bracket, battleId, winningSong);
        setBracket(updatedBracket);

        // Save to localStorage
        saveTournamentState(updatedBracket);
    };

    // Save tournament state
    const saveTournamentState = (currentBracket) => {
        const state = {
            id: tournamentId,
            songs,
            bracket: currentBracket || bracket,
            timestamp: Date.now(),
            size: tournamentSize
        };

        localStorage.setItem('currentTournament', JSON.stringify(state));
    };

    // Get shareable URL
    const getShareableUrl = () => {
        const state = {
            id: tournamentId,
            songs,
            bracket,
            size: tournamentSize
        };

        const encoded = encodeTournament(state);
        if (!encoded) return null;

        const baseUrl = window.location.origin;
        return `${baseUrl}?t=${encoded}`;
    };

    // Reset tournament
    const resetTournament = () => {
        setSongs([]);
        setBracket(null);
        setCurrentBattle(null);
        setTournamentId(null);
        localStorage.removeItem('currentTournament');
    };

    // Load a playlist (replace current songs)
    const loadPlaylist = (newSongs) => {
        if (newSongs.length > tournamentSize) {
            // Auto-resize if playlist is larger than current selection?
            // For now, just error or truncate? Let's error to be safe.
            throw new Error(`Playlist has too many songs (max ${tournamentSize})`);
        }
        setSongs(newSongs);
    };

    // Save playlist to local storage
    const saveLocalPlaylist = (name) => {
        if (songs.length === 0) {
            throw new Error('Cannot save empty playlist');
        }

        const playlists = getLocalPlaylists();
        const newPlaylist = {
            id: `local-${Date.now()}`,
            name,
            songs,
            createdAt: Date.now()
        };

        playlists.push(newPlaylist);
        localStorage.setItem('my_playlists', JSON.stringify(playlists));
        return newPlaylist;
    };

    // Get saved playlists
    const getLocalPlaylists = () => {
        try {
            const saved = localStorage.getItem('my_playlists');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error loading playlists', e);
            return [];
        }
    };

    // Delete saved playlist
    const deleteLocalPlaylist = (id) => {
        const playlists = getLocalPlaylists().filter(p => p.id !== id);
        localStorage.setItem('my_playlists', JSON.stringify(playlists));
    };

    const value = {
        songs,
        bracket,
        currentBattle,
        tournamentId,
        tournamentSize,
        setTournamentSize,
        addSong,
        removeSong,
        clearSongs,
        startTournament,
        startPrebuiltTournament,
        recordVote,
        getShareableUrl,
        resetTournament,
        loadPlaylist,
        saveLocalPlaylist,
        getLocalPlaylists,
        deleteLocalPlaylist,
        isTransitioning,
        setIsTransitioning
    };


    return (
        <TournamentContext.Provider value={value}>
            {children}
        </TournamentContext.Provider>
    );
};


