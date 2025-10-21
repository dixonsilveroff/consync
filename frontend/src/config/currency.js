/**
 * Currency Configuration for ConSync
 * 
 * This file centralizes all currency-related settings.
 * In the future, this can be extended to support multiple currencies
 * and dynamic currency selection based on user preferences or location.
 */

export const CURRENCY_CONFIG = {
  // Default currency for the application
  default: 'NGN',
  
  // Supported currencies (for future expansion)
  supported: {
    NGN: {
      code: 'NGN',
      symbol: '₦',
      name: 'Nigerian Naira',
      locale: 'en-NG',
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.'
    },
    USD: {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      locale: 'en-US',
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.'
    },
    GBP: {
      code: 'GBP',
      symbol: '£',
      name: 'British Pound',
      locale: 'en-GB',
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.'
    },
    EUR: {
      code: 'EUR',
      symbol: '€',
      name: 'Euro',
      locale: 'de-DE',
      decimalPlaces: 2,
      thousandsSeparator: '.',
      decimalSeparator: ','
    }
  }
};

/**
 * Get the current currency configuration
 * @returns {Object} Current currency config
 */
export const getCurrentCurrency = () => {
  // TODO: In the future, this can be retrieved from:
  // - User preferences in database
  // - Organization settings
  // - Browser locale detection
  // - Environment variables
  
  return CURRENCY_CONFIG.supported[CURRENCY_CONFIG.default];
};

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - Optional currency code (defaults to NGN)
 * @param {Object} options - Additional formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencyCode = null, options = {}) => {
  const currency = currencyCode 
    ? CURRENCY_CONFIG.supported[currencyCode] 
    : getCurrentCurrency();

  if (!currency) {
    console.warn(`Currency ${currencyCode} not supported, falling back to default`);
    return formatCurrency(amount, CURRENCY_CONFIG.default);
  }

  // Handle null/undefined amounts
  if (amount === null || amount === undefined) {
    return `${currency.symbol}0`;
  }

  // Parse amount if it's an object with amount property
  const numAmount = typeof amount === 'object' && amount.amount !== undefined 
    ? amount.amount 
    : Number(amount);

  // Validate that we have a valid number
  if (isNaN(numAmount)) {
    return `${currency.symbol}0`;
  }

  // Format the number
  const formattedNumber = numAmount.toLocaleString(currency.locale, {
    minimumFractionDigits: options.minimumFractionDigits ?? currency.decimalPlaces,
    maximumFractionDigits: options.maximumFractionDigits ?? currency.decimalPlaces,
  });

  return `${currency.symbol}${formattedNumber}`;
};

/**
 * Parse a currency string to a number
 * @param {string} currencyString - The currency string to parse
 * @returns {number} The parsed number
 */
export const parseCurrency = (currencyString) => {
  if (typeof currencyString === 'number') return currencyString;
  
  // Remove all currency symbols and non-numeric characters except decimal point
  const cleaned = currencyString
    .replace(/[₦$£€,\s]/g, '')
    .replace(/[^\d.-]/g, '');
  
  return parseFloat(cleaned) || 0;
};

/**
 * Get currency symbol
 * @param {string} currencyCode - Optional currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currencyCode = null) => {
  const currency = currencyCode 
    ? CURRENCY_CONFIG.supported[currencyCode] 
    : getCurrentCurrency();
  
  return currency ? currency.symbol : '₦';
};

/**
 * Convert between currencies (placeholder for future implementation)
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {number} Converted amount
 */
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  // TODO: Implement currency conversion
  // This will require:
  // 1. Exchange rate API integration
  // 2. Caching mechanism
  // 3. Fallback rates
  
  console.warn('Currency conversion not yet implemented');
  return amount;
};

export default {
  CURRENCY_CONFIG,
  getCurrentCurrency,
  formatCurrency,
  parseCurrency,
  getCurrencySymbol,
  convertCurrency
};
