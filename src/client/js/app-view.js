import { handleError } from './utils';
import { getGeoName } from './app-controller';

let $form;

const storeElements = () => {
  $form = {
    search: document.forms.search,
    destination: document.forms.search.elements['search-form__destination'],
    departure: document.forms.search.elements['search-form__departure'],
    departureDate: document.forms.search.elements['search-form__departure-date'],
    returnDate: document.forms.search.elements['search-form__return-date'],
  };
};

const onSearchFormSubmit = (event) => {
  event.preventDefault();
  event.stopPropagation();

  return getGeoName($form.destination.value)
    .then((results) => {
      console.log('>> results', results);
    })
    .catch(handleError);
};

const initEventListeners = () => {
  $form.search.addEventListener('submit', onSearchFormSubmit);
};

const init = () => {
  storeElements();
  initEventListeners();
};

window.document.addEventListener('DOMContentLoaded', init);
