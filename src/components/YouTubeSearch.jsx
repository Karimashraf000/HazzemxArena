import { useState } from 'react';
import { searchVideos, hasApiKey } from '../utils/youtubeApi';
import { NeonButton } from './UIComponents';
import './YouTubeSearch.css';

const YouTubeSearch = ({ onAddSong, disabled }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const searchYouTube = async () => {
        if (!hasApiKey()) {
            setError('YouTube API Key is missing. Please check your .env file.');
            return;
        }

        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setResults([]);

        try {
            const items = await searchVideos(query);
            setResults(items);
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
                <NeonButton
                    variant="primary"
                    onClick={searchYouTube}
                    disabled={loading || disabled}
                >
                    {loading ? 'Searching...' : 'Search'}
                </NeonButton>
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
