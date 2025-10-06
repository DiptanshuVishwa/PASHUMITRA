# Form Page Translation Template

## 1. Import Required Dependencies

```javascript
import React from 'react';
import usePageTranslation from '../hooks/usePageTranslation';
```

## 2. Use Translation Hook

```javascript
const YourFormPage = () => {
  const { t, currentLanguage } = usePageTranslation();
  
  // Rest of your component logic
};
```

## 3. Replace Static Text

### Before (Static):
```javascript
<h1>Create New Account</h1>
<label>Full Name</label>
<input placeholder="Enter your full name" />
<button>Submit</button>
```

### After (Translatable):
```javascript
<h1>{t('Create New Account')}</h1>
<label>{t('Full Name')}</label>
<input placeholder={t('Enter your full name')} />
<button>{t('Submit')}</button>
```

## 4. Add Translations to translations.js

Add to each language section:
```javascript
'Create New Account': 'नया खाता बनाएं', // Hindi
'Full Name': 'पूरा नाम',
'Enter your full name': 'अपना पूरा नाम दर्ज करें',
'Submit': 'जमा करें',
```

## 5. Form Validation Messages

```javascript
const [errors, setErrors] = useState({});

// Translate error messages
const validateForm = () => {
  const newErrors = {};
  if (!name) newErrors.name = t('Name is required');
  if (!email) newErrors.email = t('Email is required');
  setErrors(newErrors);
};
```

## 6. Dynamic Content

```javascript
// For dynamic content
const statusMessage = isLoading 
  ? t('Please wait...') 
  : success 
    ? t('Form submitted successfully') 
    : t('Ready to submit');
```