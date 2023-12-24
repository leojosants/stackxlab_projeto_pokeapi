const not_found_message = document.querySelector('#not-found-message');
const close_button = document.querySelector('.search-close-icon');
const list_wrapper = document.querySelector('.list-wrapper');
const search_input = document.querySelector('#search-input');
const number_filter = document.querySelector('#number');
const name_filter = document.querySelector('#name');
const MAX_POKEMON = 151;

let all_pokemons = [];

fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`)
    .then((response) => response.json()
        .then((data) => {
            all_pokemons = data.results;
            displayPokemons(all_pokemons);
        })
    );

async function fetchPokemonDataBeforeRedirect(id) {
    try {
        const [pokemon, pokemon_species] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json()),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) => res.json()),
        ]);
        return true;
    }
    catch (error) {
        console.error('Falha ao buscar dados do Pokémon antes do redirecionamento', error);
    }
};

function displayPokemons(pokemons) {
    list_wrapper.innerHTML = '';

    pokemons.forEach((pokemon) => {
        const pokemon_id = pokemon.url.split('/')[6];
        const list_item = document.createElement('div');
        const fragment = document.createDocumentFragment();

        list_item.className = 'list-item';
        list_item.innerHTML = `
            <div class='number-wrap'>
                <p class='caption-fonts' style='font-size: 70%;'>${pokemon_id} <<</p>
            </div>
            <div class="img-wrap">
                <img
                    src="https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pokemon_id}.svg" 
                    alt="${pokemon.name}" 
                />
            </div>
            <div class="name-wrap">
                <p class="body3-fonts">- ${pokemon.name} -</p>
            </div>
        `;

        list_item.addEventListener('click', async () => {
            const success = await fetchPokemonDataBeforeRedirect(pokemon_id);
            if (success) {
                window.location.assign(`../../assets/detail_pokemon/detail.html?id=${pokemon_id}`);
            }
        });

        fragment.appendChild(list_item);
        list_wrapper.appendChild(fragment);
    });
};

search_input.addEventListener('keyup', handleSearch);

function handleSearch() {
    const search_term = search_input.value.toLowerCase();
    let filtered_pokemons;

    if (number_filter.checked) {
        filtered_pokemons = all_pokemons.filter((pokemon) => {
            const pokemon_id = pokemon.url.split('/')[6];
            return pokemon_id.startsWith(search_term);
        });
    }
    else if (name_filter.checked) {
        filtered_pokemons = all_pokemons.filter((pokemon) =>
            pokemon.name.toLowerCase().startsWith(search_term)
        );
    }
    else {
        filtered_pokemons = all_pokemons;
    }

    displayPokemons(filtered_pokemons);

    if (filtered_pokemons === 0) {
        not_found_message.style.display = 'block';
    }
    else {
        not_found_message.style.display = 'none';
    }
}

close_button.addEventListener('click', clearSearch);

function clearSearch() {
    search_input.value = '';
    search_input.focus();
    displayPokemons(all_pokemons);
    not_found_message.style.display = 'none';
}
