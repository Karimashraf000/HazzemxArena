import { useState, useEffect } from 'react';
import './YouTubeSearch.css';

const YouTubeSearch = ({ onAddSong, disabled }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const savedKey = localStorage.getItem('youtube_api_key');
        if (savedKey) {
            setApiKey(savedKey);
        }
    }, []);

    const handleSaveKey = () => {
        localStorage.setItem('youtube_api_key', apiKey);
        setShowApiKey(false);
        setError('');
    };

    const searchYouTube = async () => {
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setResults([]);

        try {
            if (!apiKey) {
                // Demo Mode
                await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
                const mockResults = [
                    {
                        id: { videoId: 'dQw4w9WgXcQ' },
                        snippet: {
                            title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
                            channelTitle: 'Rick Astley',
                            thumbnails: { high: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' } }
                        }
                    },
                    {
                        id: { videoId: '9bZkp7q19f0' },
                        snippet: {
                            title: 'PSY - GANGNAM STYLE(강남스타일) M/V',
                            channelTitle: 'officialpsy',
                            thumbnails: { high: { url: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg' } }
                        }
                    },
                    {
                        id: { videoId: 'kJQP7kiw5Fk' },
                        snippet: {
                            title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
                            channelTitle: 'Luis Fonsi',
                            thumbnails: { high: { url: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg' } }
                        }
                    },
                    {
                        id: { videoId: 'OPf0YbXqDm0' },
                        snippet: {
                            title: 'Mark Ronson - Uptown Funk (Official Video) ft. Bruno Mars',
                            channelTitle: 'Mark Ronson',
                            thumbnails: { high: { url: 'https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg' } }
                        }
                    }
                ].filter(item => item.snippet.title.toLowerCase().includes(query.toLowerCase()));

                setResults(mockResults);
                if (mockResults.length === 0) {
                    // Fallback for demo mode if no matches
                    setResults([
                        {
                            id: { videoId: 'demo1' },
                            snippet: {
                                title: `Demo Result: ${query}`,
                                channelTitle: 'Demo Channel',
                                thumbnails: { high: { url: 'https://via.placeholder.com/120x68?text=Demo+Video' } }
                            }
                        }
                    ]);
                    setError('Demo Mode: Showing placeholder result. Add an API Key for real search.');
                }
            } else {
                // Real API Call
                const response = await fetch(
                    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error?.message || 'Failed to fetch results');
                }

                setResults(data.items);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            searchYouTube();
        }
    };

    const handleAdd = (video) => {
        const url = `https://www.youtube.com/watch?v=${video.id.videoId}`;
        onAddSong(url);
    };

    return (
        <div className="youtube-search">
            <div className="api-key-section">
                <div className="api-key-header" onClick={() => setShowApiKey(!showApiKey)}>
                    <h4>
                        ⚙️ API Key Settings
                        {!apiKey && <span className="demo-badge">Demo Mode</span>}
                    </h4>
                    <span className={`toggle-icon ${showApiKey ? 'open' : ''}`}>▼</span>
                </div>

                {showApiKey && (
                    <div className="api-key-input-container animate-fadeIn">
                        <input
                            type="password"
                            className="api-key-input"
                            placeholder="Enter YouTube Data API Key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                        <button className="btn-save" onClick={handleSaveKey}>Save</button>
                    </div>
                )}
            </div>

            <div className="search-input-group">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search for a song..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={disabled}
                />
                <button
                    className="btn btn-primary"
                    onClick={searchYouTube}
                    disabled={loading || disabled}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="search-results">
                {results.map((video) => (
                    <div key={video.id.videoId} className="search-result-item animate-fadeIn">
                        <img
                            src={video.snippet.thumbnails.high.url}
                            alt={video.snippet.title}
                            className="result-thumbnail"
                        />
                        <div className="result-info">
                            <div className="result-title" title={video.snippet.title}>
                                {video.snippet.title}
                            </div>
                            <div className="result-channel">
                                {video.snippet.channelTitle}
                            </div>
                            <button
                                className="btn-add-result"
                                onClick={() => handleAdd(video)}
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

export default YouTubeSearch;
