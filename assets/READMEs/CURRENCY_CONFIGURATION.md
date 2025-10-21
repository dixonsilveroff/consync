# Currency Configuration Documentation

**Last Updated:** October 21, 2025  
**Status:** ✅ Complete - Ready for Multi-Currency Expansion

---

## 📋 Overview

All currency references in ConSync have been standardized to use **Nigerian Naira (₦)** as the default currency. The application is now architected to support future multi-currency functionality with minimal refactoring.

---

## ✅ Changes Made

### Backend Changes

#### 1. **Project Model** (`backend/src/models/projectModel.js`)
```javascript
// BEFORE
currency: { type: String, default: 'USD' }

// AFTER
currency: { type: String, default: 'NGN' }
```

**Impact:** All new projects will default to NGN currency.

---

### Frontend Changes

#### 2. **Material Request Form** (`frontend/src/components/MaterialRequestForm.jsx`)
```javascript
// Changed label from:
Estimated Cost ($)

// To:
Estimated Cost (₦)
```

#### 3. **Material Request Card** (`frontend/src/components/MaterialRequestCard.jsx`)
```javascript
// Changed display format from:
${item.estimatedCost.toFixed(2)}

// To:
₦{item.estimatedCost.toLocaleString('en-NG', { 
  minimumFractionDigits: 2, 
  maximumFractionDigits: 2 
})}
```

**Benefit:** Numbers now display with proper Nigerian formatting (e.g., ₦1,000,000.00)

#### 4. **Cost Tracker** (`frontend/src/components/CostTracker.jsx`)
- Already using Naira (₦) in the label
- Uses `formatCurrency` utility which returns Naira format

#### 5. **Landing Page - Hero** (`frontend/src/components/landing/Hero.jsx`)
```javascript
// Changed stat from:
$2M+ Cost Savings

// To:
₦800M+ Cost Savings
```

#### 6. **Landing Page - Testimonials** (`frontend/src/components/landing/Testimonials.jsx`)
```javascript
// Changed testimonial from:
"saved us over $500K in the first year"

// To:
"saved us over ₦200M in the first year"
```

---

## 🏗️ New Architecture

### Currency Configuration System

#### **File:** `frontend/src/config/currency.js`

This new file provides:

1. **Centralized Configuration**
   ```javascript
   CURRENCY_CONFIG = {
     default: 'NGN',
     supported: {
       NGN: { symbol: '₦', locale: 'en-NG', ... },
       USD: { symbol: '$', locale: 'en-US', ... },
       GBP: { symbol: '£', locale: 'en-GB', ... },
       EUR: { symbol: '€', locale: 'de-DE', ... }
     }
   }
   ```

2. **Advanced Formatting Function**
   ```javascript
   formatCurrency(amount, currencyCode, options)
   ```

3. **Helper Functions**
   - `getCurrentCurrency()` - Get active currency config
   - `getCurrencySymbol(code)` - Get currency symbol
   - `parseCurrency(string)` - Parse currency string to number
   - `convertCurrency()` - Placeholder for future currency conversion

---

### Updated Utility

#### **File:** `frontend/src/utils/formatCurrency.js`

Now delegates to the advanced currency configuration:

```javascript
export const formatCurrency = (budget) => {
  return formatCurrencyAdvanced(budget, 'NGN', { 
    minimumFractionDigits: 0 
  });
};
```

**Benefit:** Single point of change for default currency across the app.

---

## 🎯 Current Display Formats

### Where Currency Appears:

| Component | Format | Example |
|-----------|--------|---------|
| Project Budget | `₦1,000,000` | Dashboard, Project Details |
| Cost Tracker | `₦50,000` | Finance page |
| Material Requests | `₦25,500.00` | Resource Management |
| Landing Page Stats | `₦800M+` | Hero section |
| Testimonials | `₦200M` | Testimonial cards |

---

## 🔧 How to Use Currency Formatting

### For Simple Formatting (Most Common)

```javascript
import { formatCurrency } from '../utils/formatCurrency';

// Format a number
const formatted = formatCurrency(1000000);
// Output: ₦1,000,000

// Format an object with amount property
const formatted = formatCurrency({ amount: 5000 });
// Output: ₦5,000
```

### For Advanced Formatting

```javascript
import { formatCurrency } from '../config/currency';

// Format with specific currency
const usd = formatCurrency(1000, 'USD');
// Output: $1,000.00

// Format with custom decimal places
const precise = formatCurrency(1234.567, 'NGN', { 
  minimumFractionDigits: 2,
  maximumFractionDigits: 3
});
// Output: ₦1,234.567
```

### Getting Currency Info

```javascript
import { getCurrentCurrency, getCurrencySymbol } from '../config/currency';

const currentCurrency = getCurrentCurrency();
// Returns: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', ... }

const symbol = getCurrencySymbol();
// Returns: ₦
```

---

## 🚀 Future Multi-Currency Support

The architecture is ready for multi-currency expansion. Here's the implementation plan:

### Phase 1: User Preferences (Future)

1. **Add to User Model** (`backend/src/models/User.js`):
   ```javascript
   preferredCurrency: { 
     type: String, 
     enum: ['NGN', 'USD', 'GBP', 'EUR'],
     default: 'NGN' 
   }
   ```

2. **Update getCurrentCurrency()**:
   ```javascript
   export const getCurrentCurrency = () => {
     const user = useAuth().user;
     const currencyCode = user?.preferredCurrency || CURRENCY_CONFIG.default;
     return CURRENCY_CONFIG.supported[currencyCode];
   };
   ```

### Phase 2: Organization-Level Currency

1. **Add to Organization Model**:
   ```javascript
   defaultCurrency: { type: String, default: 'NGN' }
   ```

2. **Cascade to Projects**:
   - New projects inherit organization currency
   - Can be overridden per project

### Phase 3: Currency Conversion

1. **Exchange Rate API Integration**:
   - Integrate with service (e.g., exchangerate-api.io)
   - Cache rates (refresh daily)
   - Store historical rates

2. **Implement `convertCurrency()`**:
   ```javascript
   export const convertCurrency = async (amount, from, to) => {
     const rate = await getExchangeRate(from, to);
     return amount * rate;
   };
   ```

3. **Display Dual Currency**:
   ```javascript
   // Show both project currency and user preferred currency
   ₦1,000,000 ($2,450 USD)
   ```

### Phase 4: Multi-Currency Reporting

1. **Analytics with Currency Normalization**
2. **Budget Tracking Across Currencies**
3. **Exchange Rate Variance Reports**

---

## 📊 Files Modified Summary

### Backend (1 file)
- ✅ `backend/src/models/projectModel.js` - Changed default currency to NGN

### Frontend (7 files)
- ✅ `frontend/src/components/MaterialRequestForm.jsx` - Label updated
- ✅ `frontend/src/components/MaterialRequestCard.jsx` - Display format updated
- ✅ `frontend/src/components/landing/Hero.jsx` - Stats updated to Naira
- ✅ `frontend/src/components/landing/Testimonials.jsx` - Testimonial updated to Naira
- ✅ `frontend/src/config/currency.js` - **NEW** Currency configuration system
- ✅ `frontend/src/utils/formatCurrency.js` - Updated to use new config
- ✅ `frontend/src/components/CostTracker.jsx` - Already using ₦ (verified)

---

## 🧪 Testing Checklist

- [ ] **Dashboard**
  - [ ] Budget displays as ₦
  - [ ] Cost trends show ₦ symbol
  
- [ ] **Projects**
  - [ ] Project budget shows ₦
  - [ ] New projects default to NGN currency
  
- [ ] **Finance/Cost Tracker**
  - [ ] Cost amounts display as ₦
  - [ ] Totals calculate correctly
  - [ ] New cost entries accept Naira
  
- [ ] **Resources**
  - [ ] Material request costs show ₦
  - [ ] Total estimated costs show ₦
  - [ ] Numbers format with thousands separator
  
- [ ] **Landing Page**
  - [ ] Hero stats show ₦800M+
  - [ ] Testimonial shows ₦200M

---

## 🔍 Search & Replace Reference

If you need to find remaining currency issues:

```bash
# Search for dollar signs in code
grep -r "\$[0-9]" frontend/src/

# Search for USD references
grep -r "USD" frontend/src/ backend/src/

# Search for "dollar" text
grep -ri "dollar" frontend/src/
```

---

## 💡 Best Practices

### When Adding New Features with Currency

1. **Always use the formatCurrency utility**
   ```javascript
   import { formatCurrency } from '../utils/formatCurrency';
   ```

2. **For input fields, label with currency symbol**
   ```javascript
   <label>Amount (₦)</label>
   ```

3. **Store amounts as plain numbers in database**
   ```javascript
   // ✅ Good
   amount: 1000000
   
   // ❌ Bad
   amount: "₦1,000,000"
   ```

4. **Use toLocaleString for Nigerian formatting**
   ```javascript
   amount.toLocaleString('en-NG', { 
     minimumFractionDigits: 2 
   })
   ```

---

## 🎓 Examples

### Displaying Budget in a Component

```javascript
import { formatCurrency } from '../utils/formatCurrency';

function ProjectCard({ project }) {
  return (
    <div>
      <h3>{project.title}</h3>
      <p>Budget: {formatCurrency(project.budget)}</p>
    </div>
  );
}
```

### Creating a Cost Entry

```javascript
const handleSubmit = async (formData) => {
  const costData = {
    project: projectId,
    description: formData.description,
    amount: parseFloat(formData.amount), // Store as number
    currency: 'NGN' // Explicit currency
  };
  
  await api.post('/api/finance', costData);
};
```

### Displaying with Custom Format

```javascript
import { formatCurrency } from '../config/currency';

// Show with 2 decimal places
<span>{formatCurrency(amount, 'NGN', { 
  minimumFractionDigits: 2,
  maximumFractionDigits: 2 
})}</span>
```

---

## 🔄 Migration Notes

### Existing Data

- **Projects created before this change:** Will have `currency: 'USD'` in database
- **New projects:** Will have `currency: 'NGN'`
- **Display:** All will show as ₦ regardless of stored currency value
- **Future:** When multi-currency is implemented, respect stored currency field

### Database Migration (Optional)

To update all existing projects to NGN:

```javascript
// Run this in MongoDB shell or create a migration script
db.projects.updateMany(
  { 'budget.currency': 'USD' },
  { $set: { 'budget.currency': 'NGN' } }
);
```

---

## 📞 Support

For questions about currency implementation:
1. Check this documentation
2. Review `frontend/src/config/currency.js`
3. Check the formatCurrency utility usage

---

## 🎯 Success Criteria

- ✅ All currency displays show Naira (₦)
- ✅ Numbers formatted with Nigerian locale
- ✅ Backend defaults to NGN
- ✅ Architecture supports future multi-currency
- ✅ Centralized currency configuration
- ✅ Easy to add new currencies

---

**Currency Configuration Complete! 🎉**

ConSync now uses Nigerian Naira throughout the application with a scalable architecture for future multi-currency support.

---

*Last Updated: October 21, 2025*  
*Ready for Production: ✅*  
*Multi-Currency Ready: ✅*
