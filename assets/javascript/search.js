const search_icon = document.querySelector('#search-close-icon');
const input_element = document.querySelector('#search-input');
const sort_wrapper = document.querySelector('.sort-wrapper');

input_element.addEventListener('input', () => { handleInputChange(input_element);});
search_icon.addEventListener('click', handleSearchCloseOnClick);
sort_wrapper.addEventListener('click', handleSortIconOnClick);

function handleInputChange(input_element) {
  const input_value = input_element.value;

  if (input_value !== '') {
    document.querySelector('#search-close-icon').classList.add('search-close-icon-visible');
  }
  else {
    document.querySelector('#search-close-icon').classList.remove('search-close-icon-visible');
  }
}

function handleSearchCloseOnClick() {
    document.querySelector('#search-input').value = '';
    document.querySelector('#search-close-icon').classList.remove('search-close-icon-visible');
}

function handleSortIconOnClick() {
    document.querySelector('.filter-wrapper').classList.toggle('filter-wrapper-open');
    document.querySelector('body').classList.toggle('filter-wrapper-overlay');
}
