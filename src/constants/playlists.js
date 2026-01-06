/**
 * Predefined tournament categories and playlists
 */

export const CATEGORIES = [
    {
        id: 'streamers',
        name: 'Top Streamers',
        description: 'Vote for your favorite content creators',
        icon: '🎮',
        type: 'images',
        color: 'purple',
        participants: [
            { id: 's1', name: 'Adham Pogo', image: '/TopStreamers/Adham Pogo.jpg' },
            { id: 's2', name: 'Ali Boltx', image: '/TopStreamers/AliBoltx (1).png' },
            { id: 's3', name: 'Bakry', image: '/TopStreamers/BAKRY.jpg' },
            { id: 's4', name: 'Hazemx', image: '/TopStreamers/Hazemx.jpg' },
            { id: 's5', name: 'Rated', image: '/TopStreamers/Rated.jpg' },
            { id: 's6', name: 'Seif Hegazy', image: '/TopStreamers/Seif Hegazy.jpg' },
            { id: 's7', name: 'Tarboun', image: '/TopStreamers/Tarboun.jpg' },
            { id: 's8', name: 'Weam', image: '/TopStreamers/Weam.jpg' },
        ],
    },
    {
        id: 'youtubers',
        name: 'Top YouTubers',
        description: 'Crown the ultimate YouTube champion',
        icon: '📺',
        type: 'images',
        color: 'cyan',
        participants: [
            { id: 'y1', name: 'Abdalla Lala', image: '/TopYoutubers/Abdalla lala.jpg' },
            { id: 'y2', name: 'Ahmed Hassan & Magdy', image: '/TopYoutubers/AhmedHassan-Magdy.jpg' },
            { id: 'y3', name: 'Eyad El-Mogy', image: '/TopYoutubers/Eyad-El-Mogy.jpg' },
            { id: 'y4', name: 'Iron', image: '/TopYoutubers/Iron.jpg' },
            { id: 'y5', name: 'Khaled Hossam', image: '/TopYoutubers/Khaled-Hossam.jpg' },
            { id: 'y6', name: 'Omar Kato', image: '/TopYoutubers/Omar Kato.jpg' },
            { id: 'y7', name: 'Yehia Azam', image: '/TopYoutubers/Yehia Azam.jpg' },
            { id: 'y8', name: 'Peace Cake', image: '/TopYoutubers/peace cake.jpg' },
        ],
    },
    {
        id: 'rappers',
        name: 'Top Rap Songs',
        description: 'Battle of the best Egyptian rap',
        icon: '🎤',
        type: 'images',
        color: 'pink',
        participants: [
            { id: 'r1', name: 'Wegz', image: '/Rappers/wegz.jpg' },
            { id: 'r2', name: 'Marwan Pablo', image: '/Rappers/Marwanpablo.jpg' },
            { id: 'r3', name: 'Abyusif', image: '/Rappers/abyusif.jpg' },
            { id: 'r4', name: 'Marwan Moussa', image: '/Rappers/marwanmoussa.jpg' },
            { id: 'r5', name: 'Lege-cy', image: '/Rappers/Lege-cy.jpg' },
            { id: 'r6', name: 'Afroto', image: '/Rappers/Afroto.jpg' },
            { id: 'r7', name: 'Ahmed Santa', image: '/Rappers/AhmedSanta.jpg' },
            { id: 'r8', name: 'Abo El Anwar', image: '/Rappers/AboELAnwar.jpg' },
            { id: 'r9', name: 'Husayn', image: '/Rappers/Husayn.jpg' },
            { id: 'r10', name: 'Shahyn', image: '/Rappers/Shahyn.jpg' },
            { id: 'r11', name: 'Dizzy', image: '/Rappers/Dizzy.jpg' },
            { id: 'r12', name: 'Flex', image: '/Rappers/Flex.jpg' },
            { id: 'r13', name: 'Joker', image: '/Rappers/Joker.jpg' },
            { id: 'r14', name: 'Moscow', image: '/Rappers/Moscow.jpg' },
            { id: 'r15', name: 'Arsenik', image: '/Rappers/Arsenik.jpg' },
            { id: 'r16', name: 'Weezy', image: '/Rappers/weezy.jpg' },
        ],
    },
    {
        id: 'custom',
        name: 'Custom Tournament',
        description: 'Create your own battle bracket',
        icon: '✨',
        type: 'custom',
        color: 'cyan',
        participants: [],
    },
];

/**
 * Get category by ID
 */
export function getCategoryById(id) {
    return CATEGORIES.find(cat => cat.id === id);
}

/**
 * Get random participants for quick start (8 by default)
 */
export function getRandomParticipants(category, count = 8) {
    const participants = [...category.participants];
    const shuffled = participants.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
