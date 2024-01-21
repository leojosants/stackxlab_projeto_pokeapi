let currentPokemonID = null;

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
    const pokemonID = new URLSearchParams(window.location.search).get('id');
    const id = parseInt(pokemonID, 10);

    if (id < 1 || id > MAX_POKEMONS) {
        return (window.location.href = '../../index.html');
    }

    currentPokemonID = id;
 
    loadPokemon(id);
});

async function loadPokemon(id) {
    try {
        const [pokemon, pokemonSpecies] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json()),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) => res.json()),
        ]);

        const abilitiesWrapper = document.querySelector('.pokemon-detail-wrap .pokemon-detail.move');

        abilitiesWrapper.innerHTML = '';

        if (currentPokemonID === id) {
            displayPokemonDetail(pokemon);

            const flavorText = getEnglishFlavorText(pokemonSpecies);

            document.querySelector(
                '.body3-fonts.pokemon-description'
            ).textContent = flavorText;

            const [leftArrow, rightArrow] = ['#left-arrow', '#right-arrow'].map((sel) => document.querySelector(sel));

            leftArrow.removeEventListener('click', navigatePokemon);

            rightArrow.removeEventListener('click', navigatePokemon);

            if (id !== 1) {
                leftArrow.addEventListener('click', () => {
                    navigatePokemon(id - 1);
                });
            }

            if (id !== 151) {
                rightArrow.addEventListener('click', () => {
                    navigatePokemon(id + 1);
                });
            }

            window.history.pushState({}, '', `../detail_pokemon/detail.html?id=${id}`);
        }

        return true;
    }
    catch (error) {
        console.error('Ocorreu um erro ao buscar dados do Pokemon: ', error);
    }
}

async function navigatePokemon(id) {
    currentPokemonID = id;
    await loadPokemon(id);
}

function setElementStyles(elements, cssProperty, value) {
    elements.forEach((element) => {
        element.style[cssProperty] = value;
    });
}

function rgbaFromHex(hexColor) {
    return [
        parseInt(hexColor.slice(1, 3), 16),
        parseInt(hexColor.slice(3, 5), 16),
        parseInt(hexColor.slice(5, 7), 16),
    ].join(', ');
}

function setBackGroundColor(pokemon) {
    const mainType = pokemon.types[0].type.name;
    const color = typeColors[mainType];

    if (!color) {
        console.warn(`Cor não definida para o tipo: ${mainType}`);
    }

    const detailMainElement = document.querySelector('.detail-main');

    setElementStyles(
        [detailMainElement],
        'backgroundColor',
        color,
    );

    setElementStyles(
        [detailMainElement],
        'borderColor',
        color,
    );

    setElementStyles(
        document.querySelectorAll('.power-wrapper > p'),
        'backgroundColor',
        color,
    );

    setElementStyles(
        document.querySelectorAll('.stats-wrap p.stats'),
        'color',
        color,
    );

    setElementStyles(
        document.querySelectorAll('.stats-wrap .progress-bar'),
        'color',
        color,
    );

    const rgba_color = rgbaFromHex(color);

    const styleTag = document.createElement('style');

    styleTag.innerHTML = `
        .stats-wrap .progress-bar::-webkit-progress-bar {
            background-color: rgba(${rgba_color}, 0.5);
        }

        .stats-wrap .progress-bar::-webkit-progress-value {
            background-color: ${color};
        }
    `;

    document.head.appendChild(styleTag);
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
    const capitalizePokemonName = capitalizeFirstLetter(name);
    const title = document.querySelector('title');

    title.textContent = capitalizePokemonName;

    const detailMainElement = document.querySelector('.detail-main');

    detailMainElement.classList.add(name.toLowerCase());

    document.querySelector(
        '.name-wrap .name'
    ).textContent = capitalizePokemonName;

    document.querySelector(
        '.pokemon-id-wrap .body2-fonts'
    ).textContent = `${String(id).padStart(3, '0')} <<`;

    const imageElement = document.querySelector('.detail-img-wrapper img');

    imageElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;

    imageElement.alt = name;

    const typeWrapper = document.querySelector('.power-wrapper');

    typeWrapper.innerHTML = '';

    types.forEach(({ type }) => {
        createAndAppendElement(typeWrapper, 'p',
            {
                className: `body3-fonts type ${type.name}`,
                textContent: type.name,
            }
        );
    });

    document.querySelector(
        '.pokemon-detail-wrap .pokemon-detail p.body3-fonts.weight'
    ).textContent = `${weight / 10}kg`;

    document.querySelector(
        '.pokemon-detail-wrap .pokemon-detail p.body3-fonts.height'
    ).textContent = `${height / 10}kg`;

    const abilities_wrapper = document.querySelector('.pokemon-detail-wrap .pokemon-detail.move');

    abilities.forEach(({ ability }) => {
        createAndAppendElement(abilities_wrapper, 'p',
            {
                className: 'body3-fonts',
                textContent: ability.name,
            }
        );
    });

    const statsWrapper = document.querySelector('.stats-wrapper');

    statsWrapper.innerHTML = '';

    const statNameMapping = {
        hp: 'HP',
        attack: 'ATK',
        defense: 'DEF',
        'special-attack': 'STK',
        'special-defense': 'SDEF',
        speed: 'SPD',
    };

    stats.forEach(({ stat, base_stat }) => {
        const statDiv = document.createElement('div');

        statDiv.className = 'stats-wrap';

        statsWrapper.appendChild(statDiv);

        createAndAppendElement(statDiv, 'p',
            {
                className: 'body3-fonts stats',
                textContent: statNameMapping[stat.name],
            }
        );

        createAndAppendElement(statDiv, 'p',
            {
                className: 'body3-fonts stats',
                textContent: String(base_stat).padStart(3, '0'),
            }
        );

        createAndAppendElement(statDiv, 'progress',
            {
                className: 'progress-bar',
                value: base_stat,
                max: 100,
            }
        );
    });

    setBackGroundColor(pokemon);
}

function getEnglishFlavorText(pokemonSpecies) {
    for (let entry of pokemonSpecies.flavor_text_entries) {
        if (entry.language.name === 'en') {
            const flavor = entry.flavor_text.replace(/\f/g, ' ');
            return flavor;
        }
    }
    return '';
}