const trustedDomains = require("../data/trustedDomains");

const normalize = (str) =>
  str.replace(/[^a-z0-9]/g, "");

exports.isTyposquatting = (domain) => {
  const cleanDomain = normalize(domain);

  for (const trusted of trustedDomains) {
    const cleanTrusted = normalize(trusted);

    // Exact match = safe
    if (cleanDomain === cleanTrusted) return false;

    // Similar length + partial match
    if (
      cleanDomain.includes(cleanTrusted.slice(0, 4)) ||
      cleanTrusted.includes(cleanDomain.slice(0, 4))
    ) {
      return true;
    }
  }

  return false;
};
