const getTimeString = (dateStr) => {
  const dateObj = new Date(dateStr);
  const hours = dateObj.getHours().toString().padStart(2, "0");
  const minutes = dateObj.getMinutes().toString().padStart(2, "0");
  const result = `${hours}:${minutes}`;
  return result;
};

module.exports = { getTimeString };
