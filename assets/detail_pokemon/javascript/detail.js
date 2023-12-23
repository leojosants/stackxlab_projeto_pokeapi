let current_pokemon_id = null;

const typeColors = {
    electric: "#F8D030",
    fighting: "#C03028",
    psychic: "#F85888",
    normal: "#A8A878",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    dragon: "#7038F8",
    water: "#6890F0",
    grass: "#78C850",
    ghost: "#705898",
    steel: "#B8B8D0",
    fire: "#F08030",
    rock: "#B8A038",
    dark: "#705848",
    dark: "#EE99AC",
    ice: "#98D8D8",
    bug: "#A8B820",
};

document.addEventListener('DOMContentLoaded', () => {
    const MAX_POKEMONS = 151;
    const pokemon_id = new URLSearchParams(window.location.search).get('id');
    const id = parseInt(pokemon_id, 10);

    if (id < 1 || id > MAX_POKEMONS) {
        return (window.location.ref = '../../../index.html');
    }

    current_pokemon_id = id;
    loadPokemon(id);
});

async function loadPokemon(id) {
    try {
        const [pokemon, pokemon_species] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json()),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) => res.json()),
        ]);

        const abilities_wrapper = document.querySelector('.pokemon-detail-wrap .pokemon-detail.move');
        abilities_wrapper.innerHTML = '';

        if (current_pokemon_id === id) {
            displayPokemonDetail(pokemon);
            const flavor_text = getEnglishFlavorText(pokemon_species);
            document.querySelector('.body3-fonts.pokemon-description').textContent = flavor_text;
            const [left_arrow, right_arrow] = ['#left-arrow', '#right-arrow'].map((sel) => document.querySelector(sel));
            left_arrow.removeEventListener('click', navigatePokemon);
            right_arrow.removeEventListener('click', navigatePokemon);

            if (id !== 1) { left_arrow.addEventListener('click', () => { navigatePokemon(id - 1); }); }
            if (id !== 151) { right_arrow.addEventListener('click', () => { navigatePokemon(id + 1); }); }

            window.history.pushState({}, '', `../../../assets/detail_pokemon/html/detail.html?id=${id}`);
        }

        return true;
    }
    catch (error) {
        console.error('Ocorreu um erro ao buscar dados do Pokemon: ', error);
    }
}

async function navigatePokemon(id) {
    current_pokemon_id = id;
    await loadPokemon(id);
}

function setElementStyles(elements, css_property, value) {
    elements.forEach((element) => { element.style[css_property] = value; });
}

function rgbaFromHex(hex_color) {
    return [
        parseInt(hex_color.slice(1, 3), 16),
        parseInt(hex_color.slice(3, 5), 16),
        parseInt(hex_color.slice(5, 7), 16),
    ].join(', ');
}

function setBackGroundColor(pokemon) {
    const main_type = pokemon.types[0].type.name;
    const color = typeColors[main_type];

    if (!color) {
        console.warn(`Cor não definida para o tipo: ${main_type}`);
    }

    const detail_main_element = document.querySelector('.detail-main');
    
    setElementStyles([detail_main_element], 'backgroundColor', color);
    setElementStyles([detail_main_element], 'borderColor', color);
    setElementStyles(document.querySelectorAll('.power-wrapper > p'), 'backgroundColor', color);
    setElementStyles(document.querySelectorAll('.stats-wrap p.stats'), 'color', color);
    setElementStyles(document.querySelectorAll('.stats-wrap .progress-bar'), 'color', color);

    const rgba_color = rgbaFromHex(color);

    const style_tag = document.createElement('style');
    style_tag.innerHTML = `
        .stats-wrap .progress-bar::-webkit-progress-bar {
            background-color: rgba(${rgba_color}, 0.5);
        }

        .stats-wrap .progress-bar::-webkit-progress-value {
            background-color: ${color};
        }
    `;

    document.head.appendChild(style_tag);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function createAndAppendElement(parent, tag, options = {}) {
    const element = document.createElement(tag);
    Object.keys(options).forEach((key) => { element[key] = options[key] });
    parent.appendChild(element);
    return element
}

function displayPokemonDetail(pokemon) {
    const { name, id, types, weight, height, abilities, stats } = pokemon;
    const capitalize_pokemon_name = capitalizeFirstLetter(name);

    const title = document.querySelector('title');
    title.textContent = capitalize_pokemon_name;

    const detail_main_element = document.querySelector('.detail-main');
    detail_main_element.classList.add(name.toLowerCase());

    document.querySelector('.name-wrap .name').textContent = capitalize_pokemon_name;
    document.querySelector('.pokemon-id-wrap .body2-fonts').textContent = `${String(id).padStart(3, '0')} <<`;

    const image_element = document.querySelector('.detail-img-wrapper img');
    image_element.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;
    image_element.alt = name;

    const type_wrapper = document.querySelector('.power-wrapper');
    type_wrapper.innerHTML = '';

    types.forEach(({ type }) => {
        createAndAppendElement(type_wrapper, 'p', { className: `body3-fonts type ${type.name}`, textContent: type.name, });
    });

    document.querySelector('.pokemon-detail-wrap .pokemon-detail p.body3-fonts.weight').textContent = `${weight / 10}kg`;
    document.querySelector('.pokemon-detail-wrap .pokemon-detail p.body3-fonts.height').textContent = `${height / 10}kg`;

    const abilities_wrapper = document.querySelector('.pokemon-detail-wrap .pokemon-detail.move');

    abilities.forEach(({ ability }) => {
        createAndAppendElement(abilities_wrapper, 'p', { className: 'body3-fonts', textContent: ability.name });
    });

    const stats_wrapper = document.querySelector('.stats-wrapper');
    stats_wrapper.innerHTML = '';

    const stat_name_mapping = {
        hp: 'HP',
        attack: 'ATK',
        defense: 'DEF',
        'special-attack': 'STK',
        'special-defense': 'SDEF',
        speed: 'SPD',
    };

    stats.forEach(({ stat, base_stat }) => {
        const stat_div = document.createElement('div');
        stat_div.className = 'stats-wrap';
        stats_wrapper.appendChild(stat_div);
        createAndAppendElement(stat_div, 'p', { className: 'body3-fonts stats', textContent: stat_name_mapping[stat.name] });
        createAndAppendElement(stat_div, 'p', { className: 'body3-fonts stats', textContent: String(base_stat).padStart(3, '0') });
        createAndAppendElement(stat_div, 'progress', { className: 'progress-bar', value: base_stat, max: 100 });
    });

    setBackGroundColor(pokemon);
}

function getEnglishFlavorText(pokemon_species) {
    for (let entry of pokemon_species.flavor_text_entries) {
        if (entry.language.name === 'en') {
            const flavor = entry.flavor_text.replace(/\f/g, ' ');
            return flavor;
        }
    }
    return '';
}