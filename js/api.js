/**
 * PokeAPI Service
 * Fetches dynamic Pokémon data including Pokédex flavor text, types, stats, and moves.
 */

// Helper to capitalize words
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Helper to format hyphenated names (e.g., 'vine-whip' -> 'Vine Whip')
export const formatName = (str) => {
    if (!str) return '';
    return str.split('-').map(capitalize).join(' ');
};

// Clean flavor text (remove line breaks / form feeds)
export const cleanFlavorText = (text, pokemonName = '') => {
    if (!text) return '';
    let cleaned = text.replace(/[\f\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
    if (pokemonName) {
        // Redact Pokémon name from clue so it doesn't give away the answer
        const regex = new RegExp(`\\b${pokemonName}\\b`, 'gi');
        cleaned = cleaned.replace(regex, 'this Pokémon');
    }
    return cleaned;
};

/**
 * Generates an array of clues from Pokémon API details & species data.
 */
export const generateClues = (pokemon, species) => {
    const clues = [];
    const name = capitalize(pokemon.name);

    // 1. Species Category (Genus) Clue
    const genusObj = species.genera?.find(g => g.language.name === 'en');
    if (genusObj && genusObj.genus) {
        clues.push(`It is known as the ${genusObj.genus}.`);
    }

    // 2. Types Clue
    const types = pokemon.types.map(t => capitalize(t.type.name));
    if (types.length === 1) {
        clues.push(`It is a pure ${types[0]}-type Pokémon.`);
    } else if (types.length > 1) {
        clues.push(`It is a dual-type ${types.join('/')} Pokémon.`);
    }

    // 3. Pokédex Flavor Text Entry Clue
    const englishEntries = species.flavor_text_entries?.filter(e => e.language.name === 'en') || [];
    if (englishEntries.length > 0) {
        // Pick a descriptive entry
        const entry = englishEntries[Math.floor(Math.random() * Math.min(englishEntries.length, 5))];
        const cleanedEntry = cleanFlavorText(entry.flavor_text, pokemon.name);
        clues.push(`Pokédex entry: "${cleanedEntry}"`);
    }

    // 4. Base Stats Clue
    if (pokemon.stats && pokemon.stats.length > 0) {
        const sortedStats = [...pokemon.stats].sort((a, b) => b.base_stat - a.base_stat);
        const highestStat = sortedStats[0];
        const statName = formatName(highestStat.stat.name);
        const totalStats = pokemon.stats.reduce((acc, curr) => acc + curr.base_stat, 0);
        clues.push(`Its highest base stat is ${statName} (${highestStat.base_stat}) with a total stat score of ${totalStats}.`);
    }

    // 5. Moves Clue
    if (pokemon.moves && pokemon.moves.length > 0) {
        // Pick 3 random moves
        const shuffledMoves = [...pokemon.moves].sort(() => 0.5 - Math.random());
        const sampleMoves = shuffledMoves.slice(0, 3).map(m => formatName(m.move.name));
        clues.push(`It can learn moves such as ${sampleMoves.join(', ')}.`);
    }

    return clues;
};

/**
 * Fetches dynamic Pokémon data by ID or Name from PokeAPI.
 * @param {number|string} idOrName
 * @returns {Promise<Object>}
 */
export const fetchPokemon = async (idOrName) => {
    const [pokemonRes, speciesRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${idOrName}`)
    ]);

    if (!pokemonRes.ok || !speciesRes.ok) {
        throw new Error(`Failed to load Pokémon data for: ${idOrName}`);
    }

    const pokemon = await pokemonRes.json();
    const species = await speciesRes.json();

    const types = pokemon.types.map(t => capitalize(t.type.name));
    const image = pokemon.sprites.other?.['official-artwork']?.front_default 
        || pokemon.sprites.front_default 
        || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

    const clues = generateClues(pokemon, species);

    return {
        id: pokemon.id,
        name: capitalize(pokemon.name),
        types,
        image,
        height: pokemon.height / 10, // decimeters to meters
        weight: pokemon.weight / 10, // hectograms to kg
        stats: pokemon.stats.map(s => ({
            name: formatName(s.stat.name),
            value: s.base_stat
        })),
        moves: pokemon.moves.slice(0, 5).map(m => formatName(m.move.name)),
        clues
    };
};
