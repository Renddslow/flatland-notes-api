module.exports = ({ label, description }) =>
  description ? `<h2>${label}</h2>\n<p>${description}</p>` : `<h2>${label}</h2>`;
