import { html, useState } from 'https://unpkg.com/htm/preact/standalone.module.js';

/**
 * Card Component for the Pokemon Guessing Game.
 * Displays a list of clues and reveals the Pokemon upon clicking the "Reveal" button.
 *
 * @param {Object} props
 * @param {Object} [props.pokemon] - Pokemon object containing name, clues, image, etc.
 * @param {string[]} [props.clues] - Array of clues (if passed directly).
 * @param {string} [props.name] - Pokemon name (if passed directly).
 * @param {string} [props.image] - Pokemon image URL (if passed directly).
 * @param {boolean} [props.initialRevealed=false] - Initial reveal state.
 * @param {Function} [props.onReveal] - Optional callback when revealed.
 */
export const PokemonCard = ({
    pokemon = {},
    clues,
    name,
    image,
    initialRevealed = false,
    onReveal
}) => {
    const [revealed, setRevealed] = useState(initialRevealed);

    const pokemonName = name || pokemon.name || 'Unknown Pokémon';
    const pokemonImage = image || pokemon.image || (pokemon.id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png` : '');
    const clueList = clues || pokemon.clues || [];
    const pokemonTypes = pokemon.types || [];

    const handleReveal = () => {
        setRevealed(true);
        if (onReveal) {
            onReveal(pokemon);
        }
    };

    const handleHide = () => {
        setRevealed(false);
    };

    return html`
        <div class="pokemon-card ${revealed ? 'is-revealed' : 'is-hidden'}">
            <div class="card-header">
                <span class="card-id">#${pokemon.id ? String(pokemon.id).padStart(3, '0') : '???'}</span>
                <h2 class="card-title">
                    ${revealed ? pokemonName : "Who's That Pokémon?"}
                </h2>
            </div>

            <div class="card-image-wrapper">
                ${pokemonImage ? html`
                    <img 
                        src=${pokemonImage} 
                        alt=${revealed ? pokemonName : 'Mystery Pokémon Silhouette'} 
                        class="pokemon-image ${revealed ? 'revealed-img' : 'silhouette-img'}"
                        loading="lazy"
                    />
                ` : html`
                    <div class="image-placeholder">
                        <span class="question-mark">?</span>
                    </div>
                `}
            </div>

            <div class="card-content">
                <div class="clues-container">
                    <h3 class="clues-heading">📋 Clues</h3>
                    <ul class="clues-list">
                        ${clueList.map((clue, index) => html`
                            <li key=${index} class="clue-item">
                                <span class="clue-bullet">🔍</span>
                                <span class="clue-text">${clue}</span>
                            </li>
                        `)}
                    </ul>
                </div>

                ${revealed && pokemonTypes.length > 0 ? html`
                    <div class="types-container">
                        ${pokemonTypes.map(type => html`
                            <span key=${type} class="type-pill type-${type.toLowerCase()}">
                                ${type}
                            </span>
                        `)}
                    </div>
                ` : null}

                ${revealed && (pokemon.height || pokemon.weight) ? html`
                    <div class="pokemon-meta">
                        ${pokemon.height ? html`<span>📏 Height: ${pokemon.height} m</span>` : null}
                        ${pokemon.weight ? html`<span>⚖️ Weight: ${pokemon.weight} kg</span>` : null}
                    </div>
                ` : null}
            </div>

            <div class="card-actions">
                ${!revealed ? html`
                    <button class="btn btn-reveal" onClick=${handleReveal}>
                        ✨ Reveal Pokémon
                    </button>
                ` : html`
                    <button class="btn btn-hide" onClick=${handleHide}>
                        🔄 Hide & Guess Again
                    </button>
                `}
            </div>
        </div>
    `;
};

export const Card = PokemonCard;
export default PokemonCard;
