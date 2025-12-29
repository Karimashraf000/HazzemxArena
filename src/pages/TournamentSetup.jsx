import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import { createSongFromUrl } from '../utils/songUtils';
import YouTubeSearch from '../components/YouTubeSearch';
import './TournamentSetup.css';

const TournamentSetup = () => {
    const navigate = useNavigate();
    const { songs, addSong, removeSong, startTournament } = useTournament();
    const [songUrl, setSongUrl] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('paste');

    const handleAddSong = async () => {
        if (!songUrl.trim()) {
            setError('Please enter a song URL');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const song = createSongFromUrl(songUrl);
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
            const song = createSongFromUrl(url);
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
        if (songs.length !== 32) {
            setError('You need exactly 32 songs to start the tournament');
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

    const songsNeeded = 32 - songs.length;

    return (
        <div className="tournament-setup">
            <div className="container">
                <div className="setup-header animate-fadeIn">
                    <h1>Create Your Tournament</h1>
                    <p className="song-counter">
                        {songs.length} / 32 songs added
                        {songsNeeded > 0 && <span className="songs-needed"> ({songsNeeded} more needed)</span>}
                    </p>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${(songs.length / 32) * 100}%` }}
                        />
                    </div>
                </div>

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
                            <p className="instruction">Paste YouTube or Spotify song links below</p>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="song-input"
                                    placeholder="https://youtube.com/watch?v=... or https://open.spotify.com/track/..."
                                    value={songUrl}
                                    onChange={(e) => setSongUrl(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={songs.length >= 32}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={handleAddSong}
                                    disabled={songs.length >= 32 || loading}
                                >
                                    {loading ? 'Adding...' : 'Add Song'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <YouTubeSearch
                            onAddSong={handleAddSearchedSong}
                            disabled={songs.length >= 32}
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
                                    {song.platform === 'spotify' ? '🎵' : '▶️'}
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
                    {Array(Math.max(0, 32 - songs.length)).fill(0).map((_, i) => (
                        <div key={`placeholder-${i}`} className="song-item-placeholder">
                            <span>{songs.length + i + 1}</span>
                        </div>
                    ))}
                </div>

                {songs.length === 32 && (
                    <div className="start-tournament-section animate-scaleIn">
                        <button
                            className="btn btn-primary btn-large animate-glow"
                            onClick={handleStartTournament}
                        >
                            Start Tournament 🏆
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TournamentSetup;
