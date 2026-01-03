const axios = require("axios");

const SAFE_BROWSING_URL =
  "https://safebrowsing.googleapis.com/v4/threatMatches:find";

exports.checkUrlSafety = async (url) => {
  const payload = {
    client: {
      clientId: "phishiq",
      clientVersion: "1.0"
    },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING","UNWANTED_SOFTWARE","POTENTIALLY_HARMFUL_APPLICATION"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url }]
    }
  };

  const response = await axios.post(
    `${SAFE_BROWSING_URL}?key=${process.env.SAFE_BROWSING_API_KEY}`,
    payload
  );

  return response.data.matches || null;
};