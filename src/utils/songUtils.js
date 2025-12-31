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

// Determine platform from URL
export const detectPlatform = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return 'youtube';
    }
    return null;
};

import { getVideoDetails } from './youtubeApi';

// Create song object from URL
export const createSongFromUrl = async (url) => {
    const platform = detectPlatform(url);

    if (!platform) {
        throw new Error('Invalid URL. Please use YouTube links.');
    }

    let songId;
    if (platform === 'youtube') {
        songId = parseYouTubeUrl(url);
    }

    if (!songId) {
        throw new Error('Could not extract song ID from URL.');
    }

    let title = 'YouTube Song';
    let thumbnail = null;
    let artist = 'Unknown Artist';

    // Fetch metadata for YouTube
    if (platform === 'youtube') {
        try {
            const snippet = await getVideoDetails(songId);
            if (snippet) {
                title = snippet.title;
                thumbnail = snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url || snippet.thumbnails.default?.url;
                artist = snippet.channelTitle;
            }
        } catch (error) {
            console.warn('Failed to fetch YouTube metadata:', error);
            // Continue with default values
        }
    }

    return {
        id: `${platform}-${songId}-${Date.now()}`,
        platform,
        songId,
        url,
        embedUrl: `https://www.youtube.com/embed/${songId}`,
        thumbnail: thumbnail || `https://img.youtube.com/vi/${songId}/hqdefault.jpg`,
        title,
        artist
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
