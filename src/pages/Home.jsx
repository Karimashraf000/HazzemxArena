import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import { TOP_YOUTUBERS, TopRappers, Top_Streamers } from '../data/prebuiltData';
import { featuredPlaylists } from '../data/featuredPlaylists';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const { startPrebuiltTournament } = useTournament();
    const [showSizeModal, setShowSizeModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const categories = [
        {
            id: 'streamers',
            title: 'Top Streamers',
            description: 'Battle of the gaming legends',
            image: '🎮',
            data: Top_Streamers,
            gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
        },
        {
            id: 'youtubers',
            title: 'Top YouTubers',
            description: 'Content creation kings',
            image: '🎬',
            data: TOP_YOUTUBERS,
            gradient: 'linear-gradient(135deg, #007CF0 0%, #00DFD8 100%)'
        },
        {
            id: 'songs',
            title: 'Top Rappers',
            description: 'Battle of the rappers',
            image: '🎵',
            data: TopRappers,
            gradient: 'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)'
        },
        // Add featured playlists
        ...featuredPlaylists.map(p => ({
            id: p.id,
            title: p.name,
            description: p.description,
            image: '🔥',
            data: p.songs,
            gradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
        })),
        {
            id: 'custom',
            title: 'Custom (YouTube)',
            description: 'Create your own tournament',
            image: '✨',
            data: [],
            gradient: 'linear-gradient(135deg, #FF0000 0%, #990000 100%)'
        }
    ];

    const handleCategoryClick = (category) => {
        if (category.id === 'custom') {
            navigate('/custom');
        } else if (category.id === 'streamers' || category.id === 'youtubers') {
            // Default size 8 for streamers and youtubers
            setSelectedCategory(category);
            handleStartPrebuilt(8, category);
        } else {
            setSelectedCategory(category);
            setShowSizeModal(true);
        }
    };

    const handleStartPrebuilt = async (size, categoryOverride = null) => {
        const category = categoryOverride || selectedCategory;
        if (!category) return;

        setIsLoading(true);
        setShowSizeModal(false);

        try {
            // Shuffle and slice data
            const shuffled = [...category.data].sort(() => 0.5 - Math.random());
            const selectedItems = shuffled.slice(0, size);

            const tournamentId = await startPrebuiltTournament(selectedItems, size);
            navigate(`/bracket/${tournamentId}`);
        } catch (error) {
            console.error('Error starting tournament:', error);
            alert('Failed to start tournament. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="home-page">
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-content">
                        <div className="spinner"></div>
                        <p>Preparing your arena...</p>
                        <span>Fetching song details from YouTube</span>
                    </div>
                </div>
            )}

            <div className="hero-section animate-fadeIn">
                <h1 className="main-title">Hazem Arena</h1>
                <p className="subtitle">Choose your battleground</p>
            </div>

            <div className="categories-grid animate-fadeIn delay-200">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="category-card"
                        onClick={() => handleCategoryClick(category)}
                        style={{ '--card-gradient': category.gradient }}
                    >
                        <div className="card-icon">{category.image}</div>
                        <h3>{category.title}</h3>
                        <p>{category.description}</p>
                        <button className="btn-play">Play Now</button>
                    </div>
                ))}
            </div>

            {showSizeModal && (
                <div className="modal-overlay animate-fadeIn" onClick={() => setShowSizeModal(false)}>
                    <div className="modal-content size-modal" onClick={e => e.stopPropagation()}>
                        <h2>Select Tournament Size</h2>
                        <p>How many competitors?</p>

                        <div className="size-options">
                            {[8, 16, 32].map(size => (
                                <button
                                    key={size}
                                    className="btn-size"
                                    onClick={() => handleStartPrebuilt(size)}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>

                        <button className="btn-close-modal" onClick={() => setShowSizeModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
