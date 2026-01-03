const SAFE_BROWSING_API_KEY = process.env.SAFE_BROWSING_API_KEY;

exports.analyzeWithGemini = async (inputType, inputValue) => {
  let verdict = "Safe";
  let confidenceScore = 10;
  let explanation = "No phishing indicators found.";

  // URL ANALYSIS 
  if (inputType === "url") {
    try {
      const response = await fetch(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${SAFE_BROWSING_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client: { clientId: "phishiq", clientVersion: "1.0" },
            threatInfo: {
              threatTypes: [
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE",
                "POTENTIALLY_HARMFUL_APPLICATION",
              ],
              platformTypes: ["ANY_PLATFORM"],
              threatEntryTypes: ["URL"],
              threatEntries: [{ url: inputValue }],
            },
          }),
        }
      );

      const data = await response.json();

      if (data?.matches) {
        verdict = "Phishing";
        confidenceScore = 95;
        explanation = "URL flagged by Google Safe Browsing.";
      } else {
        explanation = "URL not found in Google Safe Browsing database.";
      }
    } catch (err) {
      console.error("SAFE BROWSING ERROR:", err.message);
      explanation = "Safe Browsing check failed, fallback analysis used.";
    }

    return { verdict, confidenceScore, explanation };
  }

  //  EMAIL / TEXT ANALYSIS 
  const suspiciousWords = [
    "urgent",
    "verify",
    "click",
    "password",
    "bank",
    "login",
    "free",
    "winner",
  ];

  let score = 0;
  let reasons = [];

  suspiciousWords.forEach((word) => {
    if (inputValue.toLowerCase().includes(word)) {
      score += 15;
      reasons.push(`Suspicious keyword: "${word}"`);
    }
  });

  verdict = score >= 45 ? "Suspicious" : "Safe";
  confidenceScore = score;
  explanation =
    reasons.length > 0
      ? reasons.join(". ")
      : "No suspicious language detected.";

  return { verdict, confidenceScore, explanation };
};
