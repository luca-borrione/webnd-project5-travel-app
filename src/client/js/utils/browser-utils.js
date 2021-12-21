const scrollIntoView = (element, params = true) => {
  try {
    element.scrollIntoView(params);
    return true;
  } catch (e) {
    return false;
  }
};

const scrollTo = (element, params = {}) => {
  try {
    window.scrollTo({ ...params, top: element.offsetTop });
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Tries to scroll a given element into the view,
 * by using element.scrollIntoView if supported
 * or window.scrollTo if supported
 * @param {HTMLElement} element
 * @returns {boolean} - whether the browser succeeded in scrolling the element into the view
 */
export const scrollElementIntoView = (element) =>
  scrollIntoView(element, { behavior: 'smooth' }) ||
  scrollIntoView(element) ||
  scrollTo(element, { behavior: 'smooth' }) ||
  scrollTo(element);
