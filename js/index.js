import { html, useState, useEffect } from 'https://unpkg.com/htm/preact/standalone.module.js';
import { PokemonCard, Card } from './PokemonCard.js';
import { fetchPokemon } from './api.js';

export const GENERATIONS = [
    { id: 1, label: 'Gen 1', range: [1, 151] },
    { id: 2, label: 'Gen 2', range: [152, 251] },
    { id: 3, label: 'Gen 3', range: [252, 386] },
    { id: 4, label: 'Gen 4', range: [387, 493] },
    { id: 5, label: 'Gen 5', range: [494, 649] },
    { id: 6, label: 'Gen 6', range: [650, 721] },
    { id: 7, label: 'Gen 7', range: [722, 809] },
    { id: 8, label: 'Gen 8', range: [810, 905] },
    { id: 9, label: 'Gen 9', range: [906, 1025] },
];

// Helper to generate a random Pokémon ID from selected generations
export const getRandomPokemonIdFromGens = (selectedGenIds = [1, 2, 3]) => {
    const ranges = GENERATIONS.filter(g => selectedGenIds.includes(g.id)).map(g => g.range);
    if (ranges.length === 0) return Math.floor(Math.random() * 151) + 1;

    const totalCount = ranges.reduce((acc, [start, end]) => acc + (end - start + 1), 0);
    let randomIndex = Math.floor(Math.random() * totalCount);

    for (const [start, end] of ranges) {
        const count = end - start + 1;
        if (randomIndex < count) {
            return start + randomIndex;
        }
        randomIndex -= count;
    }
    return ranges[0][0];
};

export const App = () => {
    const [selectedGens, setSelectedGens] = useState([1, 2, 3]);
    const [currentId, setCurrentId] = useState(() => getRandomPokemonIdFromGens([1, 2, 3]));
    const [pokemonDataCache, setPokemonDataCache] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentPokemon = pokemonDataCache[currentId];

    const loadPokemon = async (id) => {
        if (pokemonDataCache[id]) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await fetchPokemon(id);
            setPokemonDataCache(prev => ({
                ...prev,
                [id]: data
            }));
        } catch (err) {
            console.error(err);
            setError(`Could not load Pokémon #${id}. Please check your connection and try again.`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPokemon(currentId);
    }, [currentId]);

    const toggleGen = (genId) => {
        let newSelected;
        if (selectedGens.includes(genId)) {
            if (selectedGens.length === 1) {
                // Keep at least one generation selected
                return;
            }
            newSelected = selectedGens.filter(id => id !== genId);
        } else {
            newSelected = [...selectedGens, genId].sort((a, b) => a - b);
        }
        setSelectedGens(newSelected);

        // If current Pokémon is not in newly selected generations, pick a new one
        const currentGen = GENERATIONS.find(g => currentId >= g.range[0] && currentId <= g.range[1]);
        if (!currentGen || !newSelected.includes(currentGen.id)) {
            const nextId = getRandomPokemonIdFromGens(newSelected);
            setCurrentId(nextId);
        }
    };

    const getNewPokemon = () => {
        const ranges = GENERATIONS.filter(g => selectedGens.includes(g.id)).map(g => g.range);
        const totalCount = ranges.reduce((acc, [start, end]) => acc + (end - start + 1), 0);

        let nextId = getRandomPokemonIdFromGens(selectedGens);
        if (totalCount > 1) {
            while (nextId === currentId) {
                nextId = getRandomPokemonIdFromGens(selectedGens);
            }
        }
        setCurrentId(nextId);
    };

    return html`
        <div class="app-container">
            <header class="app-header">
                <h1>⚡ Pokémon Guessing Game ⚡</h1>
                <p class="subtitle">Dynamic Pokédex clues powered by PokéAPI!</p>
            </header>

            <div class="gen-selector-container">
                <span class="gen-selector-label">Generations:</span>
                <div class="gen-pills">
                    ${GENERATIONS.map(gen => {
                        const isSelected = selectedGens.includes(gen.id);
                        return html`
                            <button 
                                key=${gen.id}
                                type="button"
                                class="gen-btn ${isSelected ? 'active' : ''}"
                                onClick=${() => toggleGen(gen.id)}
                                title="${gen.label} (#${gen.range[0]}-${gen.range[1]})"
                                aria-pressed=${isSelected}
                            >
                                ${gen.label}
                            </button>
                        `;
                    })}
                </div>
            </div>

            <main class="game-main">
                ${loading ? html`
                    <div class="loading-card">
                        <div class="spinner">⚡</div>
                        <p>Fetching Pokédex data from PokéAPI...</p>
                    </div>
                ` : error ? html`
                    <div class="error-card">
                        <p class="error-text">❌ ${error}</p>
                        <button class="btn btn-reveal" onClick=${() => loadPokemon(currentId)}>
                            🔄 Retry
                        </button>
                    </div>
                ` : currentPokemon ? html`
                    <${PokemonCard} 
                        key=${currentPokemon.id}
                        pokemon=${currentPokemon} 
                    />
                ` : null}

                <div class="navigation-controls">
                    <button class="nav-btn btn-random" onClick=${getNewPokemon} disabled=${loading}>
                        🎲 Get New Pokemon
                    </button>
                </div>

                <div class="nav-counter-container">
                    <span class="nav-counter">Pokémon #${currentId}</span>
                </div>
            </main>

            <footer class="app-footer">
                <p>Data dynamically fetched from PokeAPI • Preact + HTM</p>
            </footer>
        </div>
    `;
};

export { PokemonCard, Card };
