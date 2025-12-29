import { useState, useEffect } from 'react';
import './SpotifySearch.css';

const SpotifySearch = ({ onAddSong, disabled }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const savedId = localStorage.getItem('spotify_client_id');
        const savedSecret = localStorage.getItem('spotify_client_secret');
        if (savedId) setClientId(savedId);
        if (savedSecret) setClientSecret(savedSecret);
    }, []);

    const handleSaveSettings = () => {
        localStorage.setItem('spotify_client_id', clientId);
        localStorage.setItem('spotify_client_secret', clientSecret);
        setShowSettings(false);
        setError('');
    };

    const getSpotifyToken = async () => {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });
        const data = await response.json();
        return data.access_token;
    };

    const searchSpotify = async () => {
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setResults([]);

        try {
            if (!clientId || !clientSecret) {
                // Demo Mode
                await new Promise(resolve => setTimeout(resolve, 800));
                const mockResults = [
                    {
                        id: '4uLU61CZd97ubO3FbVMUZH',
                        name: 'Blinding Lights',
                        artists: [{ name: 'The Weeknd' }],
                        album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b27388657754079ed91f7d1223bc' }] }
                    },
                    {
                        id: '0VjIjW4GlWneD6vOww26v5',
                        name: 'Stay',
                        artists: [{ name: 'The Kid LAROI, Justin Bieber' }],
                        album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b27341e31f1384401f656cd77d53' }] }
                    }
                ];
                setResults(mockResults);
                setError('Demo Mode: Showing placeholder results. Add Spotify API credentials for real search.');
            } else {
                // Real API Call
                const token = await getSpotifyToken();
                const response = await fetch(
                    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
                    {
                        headers: { 'Authorization': 'Bearer ' + token }
                    }
                );
                const data = await response.json();
                if (!response.ok) throw new Error(data.error?.message || 'Failed to fetch results');
                setResults(data.tracks.items);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') searchSpotify();
    };

    const handleAdd = (track) => {
        const url = `https://open.spotify.com/track/${track.id}`;
        onAddSong(url);
    };

    return (
        <div className="spotify-search">
            <div className="spotify-auth-section">
                <div className="spotify-auth-header" onClick={() => setShowSettings(!showSettings)}>
                    <h4>
                        <span className="spotify-icon"></span> Spotify API Settings
                        {(!clientId || !clientSecret) && <span className="spotify-badge">Demo Mode</span>}
                    </h4>
                    <span className={`toggle-icon ${showSettings ? 'open' : ''}`}>▼</span>
                </div>

                {showSettings && (
                    <div className="spotify-auth-input-container animate-fadeIn">
                        <input
                            type="text"
                            className="spotify-auth-input"
                            placeholder="Client ID"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                        />
                        <input
                            type="password"
                            className="spotify-auth-input"
                            placeholder="Client Secret"
                            value={clientSecret}
                            onChange={(e) => setClientSecret(e.target.value)}
                        />
                        <button className="btn-save" onClick={handleSaveSettings}>Save</button>
                    </div>
                )}
            </div>

            <div className="search-input-group">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search Spotify tracks..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={disabled}
                />
                <button
                    className="btn btn-primary"
                    onClick={searchSpotify}
                    disabled={loading || disabled}
                    style={{ background: '#1DB954' }}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {error && <div className="error-message" style={{ borderColor: '#1DB954', color: '#1DB954' }}>{error}</div>}

            <div className="spotify-search-results">
                {results.map((track) => (
                    <div key={track.id} className="spotify-result-item animate-fadeIn">
                        <img
                            src={track.album.images[0]?.url}
                            alt={track.name}
                            className="spotify-thumbnail"
                        />
                        <div className="spotify-result-info">
                            <div className="spotify-result-title" title={track.name}>
                                {track.name}
                            </div>
                            <div className="spotify-result-artist">
                                {track.artists.map(a => a.name).join(', ')}
                            </div>
                            <button
                                className="btn-add-spotify"
                                onClick={() => handleAdd(track)}
                                disabled={disabled}
                            >
                                Add to Tournament
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SpotifySearch;
