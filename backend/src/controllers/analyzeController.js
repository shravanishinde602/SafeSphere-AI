const ScanResult = require("../models/ScanResult");
const { normalizeUrl } = require("../utils/urlUtils");
const { isTyposquatting } = require("../utils/typoCheck");
const trustedDomains = require("../data/trustedDomains");

// Debug check 
console.log("Trusted domains loaded:", trustedDomains);

exports.analyzeInput = async (req, res) => {
  try {
    const { inputType, inputValue } = req.body;

    if (!inputType || !inputValue) {
      return res.status(400).json({ error: "Input required" });
    }

    let riskScore = 0;
    let reasons = [];

    // URL ANALYSIS
    
    if (inputType.toLowerCase() === "url") {
      const domain = normalizeUrl(inputValue);

      if (!domain) {
        riskScore += 50;
        reasons.push("Invalid or malformed URL");
      } else {
        //  Trusted domain check FIRST
        if (
          Array.isArray(trustedDomains) &&
          trustedDomains.some(td => domain.endsWith(td))
        ) {
          riskScore = 0;
          reasons.push("Trusted domain");
        } else {
          // No HTTPS
          if (!inputValue.startsWith("https://")) {
            riskScore += 15;
            reasons.push("Website does not use HTTPS");
          }

          //  Phishing keyword detection
          const phishingKeywords = [
            "paypal",
            "login",
            "verify",
            "verification",
            "secure",
            "account",
            "update",
            "bank",
            "signin"
          ];

          if (phishingKeywords.some(keyword => domain.includes(keyword))) {
            riskScore += 50;
            reasons.push("Phishing-related keywords found in domain");
          }

          // Suspicious TLD detection
          const riskyTlds = ["net", "co", "xyz", "top", "tk"];
          const tld = domain.split(".").pop();

          if (riskyTlds.includes(tld)) {
            riskScore += 10;
            reasons.push("Suspicious top-level domain");
          }

          //  Typosquatting
          if (isTyposquatting(domain)) {
            riskScore += 40;
            reasons.push("Domain closely resembles a known brand");
          }

          // Subdomain abuse
          const parts = domain.split(".");
          if (parts.length > 2) {
            riskScore += 30;
            reasons.push("Suspicious use of subdomains");
          }
        }
      }
    }

    // EMAIL ANALYSIS
    if (inputType.toLowerCase() === "email") {
      const emailText = inputValue.toLowerCase();

      //  Urgency & fear keywords
      const emailKeywords = [
        "urgent",
        "immediately",
        "verify",
        "suspended",
        "limited",
        "blocked",
        "action required",
        "confirm now",
        "account compromised"
      ];

      emailKeywords.forEach(keyword => {
        if (emailText.includes(keyword)) {
          riskScore += 20;
          reasons.push(`Urgency keyword detected: "${keyword}"`);
        }
      });

      // Brand impersonation
      const brands = [
        "paypal",
        "amazon",
        "google",
        "apple",
        "microsoft",
        "bank"
      ];

      brands.forEach(brand => {
        if (emailText.includes(brand)) {
          riskScore += 15;
          reasons.push(`Brand impersonation attempt: "${brand}"`);
        }
      });

      // 🔗 Suspicious links inside email
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = emailText.match(urlRegex);

      if (urls) {
        urls.forEach(url => {
          if (!url.startsWith("https://")) {
            riskScore += 25;
            reasons.push("Insecure link found in email");
          }

          if (
            url.includes("verify") ||
            url.includes("login") ||
            url.includes("secure")
          ) {
            riskScore += 30;
            reasons.push("Phishing-style link found in email");
          }
        });
      }
    }

    //VERDICT LOGIC
    let verdict = "Safe";
    if (riskScore >= 70) verdict = "Phishing";
    else if (riskScore >= 30) verdict = "Suspicious";

    const confidenceScore = Math.min(100, riskScore + 10);

    const explanation =
      reasons.length > 0
        ? reasons.join(". ")
        : "No suspicious indicators detected.";

    //SAVE RESULT
   
    await ScanResult.create({
      inputType,
      inputValue,
      verdict,
      confidenceScore,
      explanation
    });

    return res.json({
      verdict,
      confidenceScore,
      explanation
    });

  } catch (err) {
    console.error("ANALYZE ERROR:", err);
    return res.status(500).json({ error: "Error analyzing input" });
  }
};