#!/usr/bin/env python3
"""
Mock Translation Service for Testing
Provides fake translations while we set up IndicTrans2
"""

import json
import sys

# Mock translations for testing
MOCK_TRANSLATIONS = {
    'hi': {
        'Hello, how are you?': 'नमस्ते, आप कैसे हैं?',
        'Welcome to PashuMitra Portal': 'पशुमित्र पोर्टल में आपका स्वागत है',
        'Your farm is important to us': 'आपका खेत हमारे लिए महत्वपूर्ण है',
        'Please fill out the biosecurity questionnaire': 'कृपया जैव सुरक्षा प्रश्नावली भरें',
        'Alert: Disease outbreak detected in your area': 'चेतावनी: आपके क्षेत्र में बीमारी का प्रकोप पाया गया',
        'Hello world': 'नमस्ते संसार',
        'Hello, welcome to our application': 'नमस्ते, हमारे एप्लिकेशन में आपका स्वागत है',
        'Performance test message': 'प्रदर्शन परीक्षण संदेश'
    },
    'bn': {
        'Hello, how are you?': 'হ্যালো, আপনি কেমন আছেন?',
        'Welcome to PashuMitra Portal': 'পশুমিত্র পোর্টালে স্বাগতম',
        'Hello world': 'হ্যালো বিশ্ব'
    },
    'te': {
        'Hello, how are you?': 'హలో, మీరు ఎలా ఉన్నారు?',
        'Welcome to PashuMitra Portal': 'పశుమిత్ర పోర్టల్‌కు స్వాగతం',
        'Hello world': 'హలో ప్రపంచం'
    },
    'ta': {
        'Hello, how are you?': 'வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?',
        'Welcome to PashuMitra Portal': 'பசுமித்ரா போர்ட்டலுக்கு வரவேற்கிறோம்',
        'Hello world': 'வணக்கம் உலகம்'
    },
    'gu': {
        'Hello, how are you?': 'હેલો, તમે કેવા છો?',
        'Welcome to PashuMitra Portal': 'પશુમિત્રા પોર્ટલમાં આપનું સ્વાગત છે',
        'Hello world': 'હેલો વિશ્વ'
    }
}

def mock_translate(text, target_lang):
    """Mock translation function"""
    
    if target_lang == 'en':
        return text
    
    if target_lang in MOCK_TRANSLATIONS:
        lang_dict = MOCK_TRANSLATIONS[target_lang]
        if text in lang_dict:
            return lang_dict[text]
        else:
            # Generate a mock translation for unknown text
            return f"[{target_lang.upper()}] {text}"
    
    # Unsupported language - return original
    return text

def main():
    if len(sys.argv) != 3:
        print(json.dumps({
            "success": False,
            "error": "Usage: python mock_translation.py <text> <target_lang>"
        }))
        sys.exit(1)
    
    text = sys.argv[1]
    target_lang = sys.argv[2]
    
    try:
        translated = mock_translate(text, target_lang)
        
        result = {
            "success": True,
            "original": text,
            "translated": translated,
            "target_language": target_lang,
            "mock": True  # Indicate this is a mock translation
        }
        
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e),
            "original": text,
            "target_language": target_lang
        }))

if __name__ == "__main__":
    main()