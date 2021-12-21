const MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24;

const getTodayDate = () => {
  const date = new Date(Date.now());
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const day = date.getDate();
  return new Date(year, monthIndex, day);
};

const getDaysFromToday = (dateString) => {
  const today = getTodayDate();
  const date = new Date(dateString);
  return Math.ceil((date - today) / MILLISECONDS_IN_A_DAY);
};

module.exports = {
  getDaysFromToday,
};
