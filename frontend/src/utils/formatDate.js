export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-GB', { 
    hour12: true, 
    day: 'numeric', 
    month: 'short', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};