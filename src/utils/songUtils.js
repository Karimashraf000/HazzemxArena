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

// Parse YouTube Playlist URL
export const parsePlaylistUrl = (url) => {
    const pattern = /[?&]list=([^#\&\?]+)/;
    const match = url.match(pattern);
    return match ? match[1] : null;
};

import { getPlaylistItems } from './youtubeApi';

// Create songs from playlist URL
export const createSongsFromPlaylist = async (url) => {
    const playlistId = parsePlaylistUrl(url);
    if (!playlistId) {
        throw new Error('Invalid playlist URL. Could not extract playlist ID.');
    }

    const items = await getPlaylistItems(playlistId);

    if (!items || items.length === 0) {
        throw new Error('No videos found in this playlist.');
    }

    return items.map(item => {
        const snippet = item.snippet;
        const songId = snippet.resourceId.videoId;

        return {
            id: `youtube-${songId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            platform: 'youtube',
            songId,
            url: `https://www.youtube.com/watch?v=${songId}`,
            embedUrl: `https://www.youtube.com/embed/${songId}`,
            thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
            title: snippet.title,
            artist: snippet.videoOwnerChannelTitle || snippet.channelTitle
        };
    }).filter(song => song.title !== 'Private video' && song.title !== 'Deleted video');
};

// Validate song count
export const validateSongCount = (songs) => {
    return songs.length === 32;
};
