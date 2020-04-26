module.exports = ({ label }, value) => {
  const labelContainer = `<p class="form-control__label">${label}</p>`;
  const valueContainer = `<div class="form-control__input"><span>${value}</span></div>`;
  return `<div class="form-control">\n${labelContainer}\n${valueContainer}\n</div>`;
};
