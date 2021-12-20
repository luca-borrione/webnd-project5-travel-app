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

export const scrollElementIntoView = (element) =>
  scrollIntoView(element, { behavior: 'smooth' }) ||
  scrollIntoView(element) ||
  scrollTo(element, { behavior: 'smooth' }) ||
  scrollTo(element);
