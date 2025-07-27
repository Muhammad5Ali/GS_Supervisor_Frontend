// // this function will convert the createdAt to this format:"Feb 2023"
// export function formatMemberSince(dateString) {
//   if (!dateString) return "Unknown";
  
//   try {
//     const date = new Date(dateString);
//     if (isNaN(date)) return "Invalid Date";
    
//     const month = date.toLocaleString("default", { month: "short" });
//     const year = date.getFullYear();
//     return `${month} ${year}`;
//   } catch (error) {
//     console.error("Date formatting error:", error);
//     return "Invalid Date";
//   }
// }
// //this function will convert the createdAt to this format:"May 15,2025"
// export function formatPublishDate(dateString){
//      const date=new Date(dateString);
//     const month=date.toLocaleString("default",{month:"long"});
//     const day=date.getDate();
//     const  year=date.getFullYear();
//     return `${month} ${day}, ${year}`;
// }
// export const getImageUrl = (url) => {
//   // Convert DiceBear SVG to PNG
//   if (url?.includes('dicebear') && url?.includes('svg')) {
//     return url.replace('svg?', 'png?');
//   }
//   return url;
// };
// // Add this function
// export function formatSupervisorSince(dateString) {
//   if (!dateString) return "Unknown";
  
//   try {
//     const date = new Date(dateString);
//     if (isNaN(date)) return "Invalid Date";
    
//     return date.toLocaleDateString("en-US", { 
//       month: "long", 
//       year: "numeric" 
//     });
//   } catch (error) {
//     console.error("Date formatting error:", error);
//     return "Invalid Date";
//   }
// }

// Convert createdAt to "Feb 2023"
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

// Convert createdAt to "May 15,2025"
export function formatPublishDate(dateString) {
  const date = new Date(dateString);
  const month = date.toLocaleString("default", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

// Convert DiceBear SVG to PNG
export const getImageUrl = (url) => {
  if (url?.includes('dicebear') && url?.includes('svg')) {
    return url.replace('svg?', 'png?');
  }
  return url;
};

// Format supervisor since date
export function formatSupervisorSince(dateString) {
  if (!dateString) return "Unknown";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date)) return "Invalid Date";
    
    return date.toLocaleDateString("en-US", { 
      month: "long", 
      year: "numeric" 
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid Date";
  }
}



/**
 * Truncate a string to `limit` words, adding an ellipsis if it’s longer.
 *
 * @param {string} text    The input string
 * @param {number} limit   How many words to keep
 * @returns {string}       The truncated string
 */
export function truncateWords(text = "", limit = 3) {
  // split on any whitespace
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(" ") + "…";
}
