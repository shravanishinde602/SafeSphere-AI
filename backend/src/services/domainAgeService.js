const whois = require("whois-json");

exports.getDomainAge = async (domain) => {
  try {
    const data = await whois(domain);

    if (!data || !data.creationDate) return null;

    const creationDate = new Date(data.creationDate);
    const now = new Date();

    // Age in days
    const ageDays = Math.floor((now - creationDate) / (1000 * 60 * 60 * 24));

    return ageDays;
  } catch (err) {
    console.error("WHOIS error:", err.message);
    return null; // fail safe
  }
};