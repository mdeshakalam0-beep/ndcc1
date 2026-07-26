export const getYoutubeEmbedUrl = (url?: string): string => {
  if (!url) return "";
  const trimmed = url.trim();
  let baseUrl = "";
  let queryParams: Record<string, string> = {};
  
  // 1. Parse base URL and query parameters
  if (trimmed.includes("embed/")) {
    const parts = trimmed.split("?");
    baseUrl = parts[0];
    if (parts[1]) {
      parts[1].split("&").forEach(pair => {
        const [key, val] = pair.split("=");
        if (key) queryParams[key] = val || "";
      });
    }
  } else if (trimmed.includes("/live/")) {
    const parts = trimmed.split("/live/");
    const idAndParams = parts[parts.length - 1].split("?");
    const id = idAndParams[0];
    baseUrl = `https://www.youtube.com/embed/${id}`;
    if (idAndParams[1]) {
      idAndParams[1].split("&").forEach(pair => {
        const [key, val] = pair.split("=");
        if (key) queryParams[key] = val || "";
      });
    }
  } else if (trimmed.includes("youtu.be/")) {
    const parts = trimmed.split("youtu.be/");
    const idAndParams = parts[parts.length - 1].split("?");
    const id = idAndParams[0];
    baseUrl = `https://www.youtube.com/embed/${id}`;
    if (idAndParams[1]) {
      idAndParams[1].split("&").forEach(pair => {
        const [key, val] = pair.split("=");
        if (key) queryParams[key] = val || "";
      });
    }
  } else if (trimmed.includes("v=")) {
    const parts = trimmed.split("?");
    let id = "";
    if (parts[0].includes("watch")) {
      const searchStr = parts[1] || "";
      searchStr.split("&").forEach(pair => {
        const [key, val] = pair.split("=");
        if (key === "v") id = val;
        else if (key) queryParams[key] = val || "";
      });
    }
    if (!id && trimmed.includes("v=")) {
      id = trimmed.split("v=")[1].split("&")[0];
    }
    baseUrl = `https://www.youtube.com/embed/${id}`;
  } else if (!trimmed.includes("/") && !trimmed.includes(".")) {
    // raw 11-char ID
    baseUrl = `https://www.youtube.com/embed/${trimmed}`;
  } else {
    const parts = trimmed.split("?");
    baseUrl = parts[0];
    if (parts[1]) {
      parts[1].split("&").forEach(pair => {
        const [key, val] = pair.split("=");
        if (key) queryParams[key] = val || "";
      });
    }
  }

  // 2. Set required YouTube parameters
  queryParams["rel"] = "0";
  queryParams["modestbranding"] = "1";
  queryParams["playsinline"] = "1";
  queryParams["controls"] = "1";
  queryParams["fs"] = "1";
  queryParams["iv_load_policy"] = "3";
  queryParams["cc_load_policy"] = "0";
  queryParams["enablejsapi"] = "1";
  queryParams["autoplay"] = "0";
  queryParams["origin"] = window.location.origin;

  // 3. Reconstruct query string
  const queryString = Object.entries(queryParams)
    .map(([key, val]) => `${key}=${val}`)
    .join("&");

  return `${baseUrl}?${queryString}`;
};
