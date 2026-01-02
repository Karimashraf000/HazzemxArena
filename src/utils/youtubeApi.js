
// YouTube Data API Utility

const getApiKey = () => {
    // Check environment variable first (for development)
    if (import.meta.env.VITE_YOUTUBE_API_KEY) {
        return import.meta.env.VITE_YOUTUBE_API_KEY;
    }
    return null;
};

export const hasApiKey = () => {
    return !!getApiKey();
};

export const searchVideos = async (query, maxResults = 10) => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('No API Key found. Please check your environment variables.');
    }

    const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch results from YouTube');
    }

    return data.items;
};

export const getVideoDetails = async (videoId) => {
    const apiKey = getApiKey();
    if (!apiKey) {
        // Fallback if no key, return null so caller can use defaults
        return null;
    }

    const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch video details');
    }

    if (data.items && data.items.length > 0) {
        return data.items[0].snippet;
    }

    return null;
};

export const getPlaylistItems = async (playlistId, maxResults = 50) => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('No API Key found. Please check your environment variables.');
    }

    const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${maxResults}&playlistId=${playlistId}&key=${apiKey}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch playlist items');
    }

    return data.items;
};
