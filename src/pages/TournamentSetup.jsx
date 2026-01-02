import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import { createSongFromUrl, createSongsFromPlaylist } from '../utils/songUtils';
import YouTubeSearch from '../components/YouTubeSearch';
import { hasApiKey } from '../utils/youtubeApi';
import { GlassCard, NeonButton, AnimatedText } from '../components/UIComponents';
import { motion, AnimatePresence } from 'framer-motion';
import './TournamentSetup.css';

const TournamentSetup = () => {
    const navigate = useNavigate();
    const { songs, addSong, removeSong, startTournament, saveLocalPlaylist, getLocalPlaylists, loadPlaylist, deleteLocalPlaylist, tournamentSize, setTournamentSize, clearSongs } = useTournament();
    const [songUrl, setSongUrl] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('paste');
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [playlistName, setPlaylistName] = useState('');
    const [savedPlaylists, setSavedPlaylists] = useState([]);

    const handleAddSong = async () => {
        if (!songUrl.trim()) {
            setError('Please enter a song URL');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const song = await createSongFromUrl(songUrl);
            addSong(song);
            setSongUrl('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSearchedSong = async (url) => {
        try {
            setLoading(true);
            setError('');
            const song = await createSongFromUrl(url);
            addSong(song);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const [playlistUrl, setPlaylistUrl] = useState('');

    const handleImportPlaylist = async () => {
        if (!hasApiKey()) {
            setError('YouTube API Key is missing. Please check your .env file.');
            return;
        }

        if (!playlistUrl.trim()) {
            setError('Please enter a playlist URL');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const newSongs = await createSongsFromPlaylist(playlistUrl);

            // Add songs one by one or batch add if context supports it
            // For now, loop add
            newSongs.forEach(song => {
                if (songs.length < tournamentSize) {
                    addSong(song);
                }
            });

            setPlaylistUrl('');
            alert(`Imported ${newSongs.length} songs!`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveSong = (songId) => {
        removeSong(songId);
    };

    const handleStartTournament = () => {
        if (songs.length !== tournamentSize) {
            setError(`You need exactly ${tournamentSize} songs to start the tournament`);
            return;
        }

        try {
            const tournamentId = startTournament();
            navigate(`/bracket/${tournamentId}`);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddSong();
        }
    };

    const handleSavePlaylist = () => {
        if (!playlistName.trim()) {
            setError('Please enter a playlist name');
            return;
        }
        try {
            saveLocalPlaylist(playlistName);
            setPlaylistName('');
            setError('');
            alert('Playlist saved!');
            setSavedPlaylists(getLocalPlaylists());
        } catch (err) {
            setError(err.message);
        }
    };

    const handleOpenPlaylists = () => {
        setSavedPlaylists(getLocalPlaylists());
        setShowPlaylistModal(true);
    };

    const handleLoadPlaylist = (playlist) => {
        try {
            if (playlist.songs.length > tournamentSize) {
                if (playlist.songs.length === 32) setTournamentSize(32);
                else if (playlist.songs.length === 16) setTournamentSize(16);
                else if (playlist.songs.length === 8) setTournamentSize(8);
            }

            loadPlaylist(playlist.songs);
            setShowPlaylistModal(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeletePlaylist = (id) => {
        deleteLocalPlaylist(id);
        setSavedPlaylists(getLocalPlaylists());
    };

    const handleSizeChange = (e) => {
        const newSize = parseInt(e.target.value);
        if (songs.length > newSize) {
            if (!window.confirm(`Switching to ${newSize} songs will remove excess songs. Continue?`)) {
                return;
            }
        }
        setTournamentSize(newSize);
    };

    const songsNeeded = tournamentSize - songs.length;

    return (
        <div className="tournament-setup">
            <div className="container">
                <div className="setup-header">
                    <div className="header-top">
                        <AnimatedText text="Create Your Tournament" className="page-title" />
                        <div className="header-controls">
                            <NeonButton variant="secondary" onClick={() => navigate('/')}>
                                🏠 Home
                            </NeonButton>
                            <select
                                className="size-selector"
                                value={tournamentSize}
                                onChange={handleSizeChange}
                            >
                                <option value={8}>8 Songs</option>
                                <option value={16}>16 Songs</option>
                                <option value={32}>32 Songs</option>
                            </select>
                            <NeonButton variant="secondary" onClick={handleOpenPlaylists}>
                                📂 My Playlists
                            </NeonButton>
                        </div>
                    </div>
                    <p className="song-counter">
                        <span className="count">{songs.length}</span> / {tournamentSize} songs added
                        {songsNeeded > 0 && <span className="songs-needed"> ({songsNeeded} more needed)</span>}
                    </p>
                    <div className="progress-bar">
                        <motion.div
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${(songs.length / tournamentSize) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>

                <AnimatePresence>
                    {showPlaylistModal && (
                        <motion.div
                            className="modal-overlay"
                            onClick={() => setShowPlaylistModal(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <GlassCard className="modal-content" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>My Playlists</h2>
                                    <button className="btn-close" onClick={() => setShowPlaylistModal(false)}>✕</button>
                                </div>
                                <div className="saved-playlists-list">
                                    {savedPlaylists.length === 0 ? (
                                        <p className="empty-state">No saved playlists yet.</p>
                                    ) : (
                                        savedPlaylists.map(p => (
                                            <div key={p.id} className="saved-playlist-item">
                                                <div className="playlist-details">
                                                    <h3>{p.name}</h3>
                                                    <span>{p.songs.length} songs • {new Date(p.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="playlist-actions">
                                                    <NeonButton variant="primary" className="btn-small" onClick={() => handleLoadPlaylist(p)}>Load</NeonButton>
                                                    <NeonButton variant="accent" className="btn-small" onClick={() => handleDeletePlaylist(p.id)}>Delete</NeonButton>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                <GlassCard className="add-song-section">
                    <div className="add-method-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'paste' ? 'active' : ''}`}
                            onClick={() => setActiveTab('paste')}
                        >
                            Paste Link
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
                            onClick={() => setActiveTab('search')}
                        >
                            Search YouTube
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'playlist' ? 'active' : ''}`}
                            onClick={() => setActiveTab('playlist')}
                        >
                            Import Playlist
                        </button>
                    </div>

                    {activeTab === 'paste' ? (
                        <>
                            <p className="instruction">Paste YouTube song links below</p>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="song-input"
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={songUrl}
                                    onChange={(e) => setSongUrl(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={songs.length >= tournamentSize}
                                />
                                <NeonButton
                                    variant="primary"
                                    onClick={handleAddSong}
                                    disabled={songs.length >= tournamentSize || loading}
                                >
                                    {loading ? 'Adding...' : 'Add Song'}
                                </NeonButton>
                            </div>
                        </>
                    ) : activeTab === 'playlist' ? (
                        <>
                            <p className="instruction">Paste YouTube Playlist URL to import all songs</p>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="song-input"
                                    placeholder="https://youtube.com/playlist?list=..."
                                    value={playlistUrl}
                                    onChange={(e) => setPlaylistUrl(e.target.value)}
                                    disabled={songs.length >= tournamentSize}
                                />
                                <NeonButton
                                    variant="primary"
                                    onClick={handleImportPlaylist}
                                    disabled={songs.length >= tournamentSize || loading}
                                >
                                    {loading ? 'Importing...' : 'Import Playlist'}
                                </NeonButton>
                            </div>
                        </>
                    ) : (
                        <YouTubeSearch
                            onAddSong={handleAddSearchedSong}
                            disabled={songs.length >= tournamentSize}
                        />
                    )}

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                className="error-message"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </GlassCard>

                <div className="songs-grid">
                    <AnimatePresence>
                        {songs.map((song, index) => (
                            <GlassCard
                                key={song.id}
                                className="song-item"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="song-number">{index + 1}</div>
                                {song.thumbnail ? (
                                    <img src={song.thumbnail} alt={song.title} className="song-thumbnail" />
                                ) : (
                                    <div className="song-thumbnail-placeholder">▶️</div>
                                )}
                                <div className="song-info">
                                    <div className="song-title">{song.title}</div>
                                    <div className="song-platform">{song.platform}</div>
                                </div>
                                <button
                                    className="btn-remove"
                                    onClick={() => handleRemoveSong(song.id)}
                                    title="Remove song"
                                >
                                    ✕
                                </button>
                            </GlassCard>
                        ))}
                    </AnimatePresence>

                    {/* Placeholder boxes */}
                    {Array(Math.max(0, tournamentSize - songs.length)).fill(0).map((_, i) => (
                        <div key={`placeholder-${i}`} className="song-item-placeholder">
                            <span>{songs.length + i + 1}</span>
                        </div>
                    ))}
                </div>

                <div className="action-bar">
                    <div className="save-playlist-group">
                        <input
                            type="text"
                            placeholder="Playlist Name"
                            value={playlistName}
                            onChange={(e) => setPlaylistName(e.target.value)}
                            className="playlist-name-input"
                        />
                        <NeonButton variant="secondary" onClick={handleSavePlaylist} disabled={songs.length === 0}>
                            💾 Save Playlist
                        </NeonButton>
                    </div>

                    {songs.length === tournamentSize && (
                        <NeonButton
                            variant="primary"
                            className="btn-large"
                            onClick={handleStartTournament}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            Start Tournament 🏆
                        </NeonButton>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TournamentSetup;
