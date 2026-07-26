export const getYoutubeEmbedUrl = (url?: string): string => {
  if (!url) return "";
  const trimmed = url.trim();
  let id = "";
  
  // Parse formats and extract the video ID
  if (trimmed.includes("embed/")) {
    const parts = trimmed.split("embed/");
    id = parts[parts.length - 1].split("?")[0].split("&")[0];
  } else if (trimmed.includes("/live/")) {
    const parts = trimmed.split("/live/");
    id = parts[parts.length - 1].split("?")[0].split("&")[0];
  } else if (trimmed.includes("youtu.be/")) {
    const parts = trimmed.split("youtu.be/");
    id = parts[parts.length - 1].split("?")[0].split("&")[0];
  } else if (trimmed.includes("v=")) {
    const afterV = trimmed.split("v=")[1];
    id = afterV.split("&")[0].split("?")[0];
  } else if (!trimmed.includes("/") && !trimmed.includes(".")) {
    id = trimmed;
  } else {
    const parts = trimmed.split("?")[0].split("/");
    id = parts[parts.length - 1];
  }

  id = id.trim();
  return id ? `https://www.youtube.com/embed/${id}` : "";
};
