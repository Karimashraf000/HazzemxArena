import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import { createSongFromUrl } from '../utils/songUtils';
import YouTubeSearch from '../components/YouTubeSearch';

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
            setSavedPlaylists(getLocalPlaylists()); // Refresh list
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
            // Check if playlist size matches current size or if we need to adjust
            if (playlist.songs.length > tournamentSize) {
                // Option: Auto-resize tournament to fit playlist?
                // For now, let's just warn or error
                // Or better, let's auto-switch size if it's a standard size
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
                <div className="setup-header animate-fadeIn">
                    <div className="header-top">
                        <h1>Create Your Tournament</h1>
                        <div className="header-controls">
                            <button className="btn-secondary" onClick={() => navigate('/')}>
                                🏠 Home
                            </button>
                            <select
                                className="size-selector"
                                value={tournamentSize}
                                onChange={handleSizeChange}
                            >
                                <option value={8}>8 Songs</option>
                                <option value={16}>16 Songs</option>
                                <option value={32}>32 Songs</option>
                            </select>
                            <button className="btn-secondary" onClick={handleOpenPlaylists}>
                                📂 My Playlists
                            </button>
                        </div>
                    </div>
                    <p className="song-counter">
                        {songs.length} / {tournamentSize} songs added
                        {songsNeeded > 0 && <span className="songs-needed"> ({songsNeeded} more needed)</span>}
                    </p>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${(songs.length / tournamentSize) * 100}%` }}
                        />
                    </div>
                </div>

                {showPlaylistModal && (
                    <div className="modal-overlay animate-fadeIn" onClick={() => setShowPlaylistModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
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
                                                <button className="btn-small btn-primary" onClick={() => handleLoadPlaylist(p)}>Load</button>
                                                <button className="btn-small btn-danger" onClick={() => handleDeletePlaylist(p.id)}>Delete</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="add-song-section card card-glow animate-fadeIn delay-200">
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
                                <button
                                    className="btn btn-primary"
                                    onClick={handleAddSong}
                                    disabled={songs.length >= tournamentSize || loading}
                                >
                                    {loading ? 'Adding...' : 'Add Song'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <YouTubeSearch
                            onAddSong={handleAddSearchedSong}
                            disabled={songs.length >= tournamentSize}
                        />
                    )}

                    {error && (
                        <div className="error-message animate-scaleIn">
                            {error}
                        </div>
                    )}
                </div>

                <div className="songs-grid animate-fadeIn delay-300">
                    {songs.map((song, index) => (
                        <div key={song.id} className="song-item card animate-scaleIn" style={{ animationDelay: `${index * 0.05}s` }}>
                            <div className="song-number">{index + 1}</div>
                            {song.thumbnail && (
                                <img src={song.thumbnail} alt={song.title} className="song-thumbnail" />
                            )}
                            {!song.thumbnail && (
                                <div className="song-thumbnail-placeholder">
                                    ▶️
                                </div>
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
                        </div>
                    ))}

                    {/* Placeholder boxes */}
                    {Array(Math.max(0, tournamentSize - songs.length)).fill(0).map((_, i) => (
                        <div key={`placeholder-${i}`} className="song-item-placeholder">
                            <span>{songs.length + i + 1}</span>
                        </div>
                    ))}
                </div>

                <div className="action-bar animate-scaleIn">
                    <div className="save-playlist-group">
                        <input
                            type="text"
                            placeholder="Playlist Name"
                            value={playlistName}
                            onChange={(e) => setPlaylistName(e.target.value)}
                            className="playlist-name-input"
                        />
                        <button className="btn-secondary" onClick={handleSavePlaylist} disabled={songs.length === 0}>
                            💾 Save Playlist
                        </button>
                    </div>

                    {songs.length === tournamentSize && (
                        <button
                            className="btn btn-primary btn-large animate-glow"
                            onClick={handleStartTournament}
                        >
                            Start Tournament 🏆
                        </button>
                    )}
                </div>
            </div >
        </div >
    );
};

export default TournamentSetup;
