// Parse YouTube URL to extract video ID
export const parseYouTubeUrl = (url) => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    return null;
};

// Parse Spotify URL to extract track ID
export const parseSpotifyUrl = (url) => {
    const patterns = [
        /spotify\.com\/track\/([^?&\n]+)/,
        /spotify\.com\/embed\/track\/([^?&\n]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    return null;
};

// Determine platform from URL
export const detectPlatform = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return 'youtube';
    }
    if (url.includes('spotify.com')) {
        return 'spotify';
    }
    return null;
};

// Create song object from URL
export const createSongFromUrl = (url) => {
    const platform = detectPlatform(url);

    if (!platform) {
        throw new Error('Invalid URL. Please use YouTube or Spotify links.');
    }

    let songId;
    if (platform === 'youtube') {
        songId = parseYouTubeUrl(url);
    } else if (platform === 'spotify') {
        songId = parseSpotifyUrl(url);
    }

    if (!songId) {
        throw new Error('Could not extract song ID from URL.');
    }

    return {
        id: `${platform}-${songId}-${Date.now()}`,
        platform,
        songId,
        url,
        embedUrl: platform === 'youtube'
            ? `https://www.youtube.com/embed/${songId}`
            : `https://open.spotify.com/embed/track/${songId}`,
        thumbnail: platform === 'youtube'
            ? `https://img.youtube.com/vi/${songId}/hqdefault.jpg`
            : null,
        title: platform === 'youtube' ? 'YouTube Song' : 'Spotify Track',
        artist: 'Unknown Artist'
    };
};

// Get embed URL for a song
export const getEmbedUrl = (song) => {
    return song.embedUrl;
};

// Validate song count
export const validateSongCount = (songs) => {
    return songs.length === 32;
};
