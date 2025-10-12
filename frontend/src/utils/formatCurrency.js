export const formatCurrency = (budget) => {
  if (!budget) return '₦0';
  
  // Handle if budget is passed as a number directly
  if (typeof budget === 'number') {
    return '₦' + budget.toLocaleString('en-NG', { minimumFractionDigits: 0 });
  }

  // Handle if budget is an object with amount property
  const amount = budget.amount || 0;
  return '₦' + amount.toLocaleString('en-NG', { minimumFractionDigits: 0 });
};