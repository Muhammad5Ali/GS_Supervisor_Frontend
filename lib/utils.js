// this function will convert the createdAt to this format:"Feb 2023"
export function formatMemberSince(dateString) {
  if (!dateString) return "Unknown";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date)) return "Invalid Date";
    
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${month} ${year}`;
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid Date";
  }
}
//this function will convert the createdAt to this format:"May 15,2025"
export function formatPublishDate(dateString){
     const date=new Date(dateString);
    const month=date.toLocaleString("default",{month:"long"});
    const day=date.getDate();
    const  year=date.getFullYear();
    return `${month} ${day}, ${year}`;
}
export const getImageUrl = (url) => {
  // Convert DiceBear SVG to PNG
  if (url?.includes('dicebear') && url?.includes('svg')) {
    return url.replace('svg?', 'png?');
  }
  return url;
};