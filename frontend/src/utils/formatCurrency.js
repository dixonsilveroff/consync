/**
 * Currency formatting utility
 * 
 * This file provides a simple interface for currency formatting.
 * For more advanced currency features, see config/currency.js
 */

import { formatCurrency as formatCurrencyAdvanced } from '../config/currency';

/**
 * Format a number as Nigerian Naira (₦)
 * @param {number|Object} budget - The amount to format (number or object with amount property)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (budget) => {
  // Use the advanced currency formatter with NGN as default
  return formatCurrencyAdvanced(budget, 'NGN', { minimumFractionDigits: 0 });
};

export default formatCurrency;