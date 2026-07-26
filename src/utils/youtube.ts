export const getYoutubeEmbedUrl = (url?: string): string => {
  if (!url) return "";
  const trimmed = url.trim();
  
  // If it is already an embed URL
  if (trimmed.includes("embed/")) return trimmed;
  
  // Handle youtu.be links
  if (trimmed.includes("youtu.be/")) {
    const parts = trimmed.split("youtu.be/");
    const id = parts[parts.length - 1].split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  
  // Handle standard watch?v= links
  if (trimmed.includes("v=")) {
    const id = trimmed.split("v=")[1].split("&")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  
  // Fallback
  return trimmed;
};
