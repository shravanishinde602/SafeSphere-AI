exports.normalizeUrl = (input) => {
  let url = input.trim().toLowerCase();

  if (!url.startsWith("http")) {
    url = "https://" + url;
  }

  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
};
