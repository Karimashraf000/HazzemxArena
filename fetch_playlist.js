
import fs from 'fs';

const API_KEY = process.env.VITE_YOUTUBE_API_KEY;
const PLAYLIST_ID = 'PLPX9rPewOkul-jOM4LkepemVCNTbodd6a';

async function getPlaylistItems(playlistId) {
    let allItems = [];
    let nextPageToken = '';

    try {
        do {
            const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}&pageToken=${nextPageToken}`;
            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Failed to fetch playlist items');
            }

            allItems = allItems.concat(data.items);
            nextPageToken = data.nextPageToken;
        } while (nextPageToken);

        return allItems;
    } catch (error) {
        console.error('Error:', error.message);
        return [];
    }
}

async function main() {
    if (!API_KEY) {
        console.error('VITE_YOUTUBE_API_KEY is not set.');
        return;
    }

    console.log('Fetching playlist items...');
    const items = await getPlaylistItems(PLAYLIST_ID);

    if (items.length === 0) {
        console.log('No items found.');
        return;
    }

    console.log(`Found ${items.length} items. Picking 32 random ones...`);

    const shuffled = items.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 32).map(item => ({
        id: item.snippet.resourceId.videoId,
        name: item.snippet.title,
        image: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
        platform: 'youtube'
    }));

    fs.writeFileSync('egyptian_rap_data.json', JSON.stringify(selected, null, 2));
    console.log('Saved 32 songs to egyptian_rap_data.json');
}

main();
