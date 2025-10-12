export const formatCurrency = (num) => {
  if (!num) return '₦0';
  return '₦' + num.toLocaleString('en-NG', { minimumFractionDigits: 0 });
};