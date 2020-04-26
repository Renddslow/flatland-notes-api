const { startOfWeek, addDays } = require('date-fns');

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

module.exports = (today = new Date()) => {
  const start = startOfWeek(today, { weekStartsOn: 6 });
  const satDisplay = `${months[start.getMonth()]} ${start.getDate()}`;
  const sun = addDays(start, 1);
  return `${satDisplay}/${sun.getDate()}`;
};
