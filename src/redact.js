const redactUnit = (u) =>
  Array(u.length)
    .fill('*')
    .map((val, idx) => (idx === 0 || idx === u.length - 1 ? u[idx] : val))
    .join('');

module.exports = (email) => {
  const [user, domain] = email.split('@');
  const [url, tld] = domain.split('.');

  const userRedacted = redactUnit(user);
  const domainRedacted = redactUnit(url);
  return `${userRedacted}@${domainRedacted}.${tld}`;
};
