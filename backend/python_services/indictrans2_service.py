#!/usr/bin/env python3
"""
IndicTrans2 Bridge Service for PashuMitra Portal
===============================================

This service bridges Node.js backend with IndicTrans2 models for translation.
It handles translation requests from the PashuMitra Portal backend.

Usage:
    python indictrans2_service.py <text> <src_lang> <tgt_lang>
    
Arguments:
    text: Text to translate
    src_lang: Source language code (e.g., 'eng_Latn', 'hin_Deva')
    tgt_lang: Target language code
    
Output:
    JSON response with translation result
"""

import sys
import json
import os
import logging
import warnings
from pathlib import Path
from typing import Union, List, Dict, Any

# Suppress HuggingFace warnings
warnings.filterwarnings("ignore", message=".*resume_download.*")
warnings.filterwarnings("ignore", category=FutureWarning)

# Add the IndicTrans2 directory to Python path
indictrans_path = Path(__file__).parent.parent.parent / 'IndicTrans2'
sys.path.insert(0, str(indictrans_path))

# Configure logging
logging.basicConfig(level=logging.ERROR, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class IndicTrans2Service:
    """IndicTrans2 Translation Service Bridge"""
    
    def __init__(self):
        """Initialize the translation service"""
        self.translator = None
        self.initialized = False
        
        # Language code mapping from common codes to IndicTrans2 codes
        self.lang_mapping = {
            # Common -> IndicTrans2 format
            'hi': 'hin_Deva',  # Hindi
            'bn': 'ben_Beng',  # Bengali
            'te': 'tel_Telu',  # Telugu
            'mr': 'mar_Deva',  # Marathi
            'ta': 'tam_Taml',  # Tamil
            'gu': 'guj_Gujr',  # Gujarati
            'kn': 'kan_Knda',  # Kannada
            'ml': 'mal_Mlym',  # Malayalam
            'pa': 'pan_Guru',  # Punjabi
            'or': 'ory_Orya',  # Odia
            'as': 'asm_Beng',  # Assamese
            'ur': 'urd_Arab',  # Urdu
            'ne': 'npi_Deva',  # Nepali
            'kok': 'gom_Deva', # Konkani
            'mni': 'mni_Beng', # Manipuri (Bengali script)
            'sd': 'snd_Deva',  # Sindhi (Devanagari)
            'mai': 'mai_Deva', # Maithili
            'brx': 'brx_Deva', # Bodo
            'sat': 'sat_Olck', # Santali
            'doi': 'doi_Deva', # Dogri
            'ks': 'kas_Deva',  # Kashmiri (Devanagari)
            'gom': 'gom_Deva', # Goan Konkani
            'san': 'san_Deva', # Sanskrit
            'en': 'eng_Latn',  # English
        }
        
        # Reverse mapping
        self.reverse_lang_mapping = {v: k for k, v in self.lang_mapping.items()}
    
    def initialize(self):
        """Initialize the IndicTrans2 translator"""
        if self.initialized:
            return
        
        try:
            # Import the IndicTrans2 utilities
            from indictrans_utils import IndicTrans2Translator
            
            # Initialize translator
            self.translator = IndicTrans2Translator()
            self.initialized = True
            logger.info("IndicTrans2 service initialized successfully")
            
        except ImportError as e:
            logger.error(f"Failed to import IndicTrans2 utilities: {e}")
            raise
        except Exception as e:
            logger.error(f"Failed to initialize IndicTrans2 service: {e}")
            raise
    
    def normalize_language_code(self, lang_code: str) -> str:
        """Convert common language code to IndicTrans2 format"""
        if lang_code in self.lang_mapping:
            return self.lang_mapping[lang_code]
        elif lang_code in self.reverse_lang_mapping:
            return lang_code  # Already in IndicTrans2 format
        else:
            # Default to English if unknown
            return 'eng_Latn'
    
    def translate_text(self, text: str, src_lang: str, tgt_lang: str) -> Dict[str, Any]:
        """
        Translate text from source language to target language
        
        Args:
            text: Text to translate
            src_lang: Source language code
            tgt_lang: Target language code
            
        Returns:
            Dictionary with translation result
        """
        try:
            # Initialize if needed
            if not self.initialized:
                self.initialize()
            
            # Normalize language codes
            src_lang_norm = self.normalize_language_code(src_lang)
            tgt_lang_norm = self.normalize_language_code(tgt_lang)
            
            # Skip translation if source and target are the same
            if src_lang_norm == tgt_lang_norm:
                return {
                    'success': True,
                    'original': text,
                    'translated': text,
                    'source_language': src_lang_norm,
                    'target_language': tgt_lang_norm,
                    'message': 'No translation needed (same language)'
                }
            
            # Perform translation
            translated_text = self.translator.translate(
                text, 
                src_lang_norm, 
                tgt_lang_norm
            )
            
            return {
                'success': True,
                'original': text,
                'translated': translated_text,
                'source_language': src_lang_norm,
                'target_language': tgt_lang_norm
            }
            
        except Exception as e:
            logger.error(f"Translation error: {e}")
            return {
                'success': False,
                'original': text,
                'translated': text,  # Fallback to original
                'source_language': src_lang,
                'target_language': tgt_lang,
                'error': str(e)
            }
    
    def translate_batch(self, texts: List[str], src_lang: str, tgt_lang: str) -> List[Dict[str, Any]]:
        """
        Translate multiple texts
        
        Args:
            texts: List of texts to translate
            src_lang: Source language code
            tgt_lang: Target language code
            
        Returns:
            List of translation results
        """
        try:
            # Initialize if needed
            if not self.initialized:
                self.initialize()
            
            # Normalize language codes
            src_lang_norm = self.normalize_language_code(src_lang)
            tgt_lang_norm = self.normalize_language_code(tgt_lang)
            
            # Skip translation if source and target are the same
            if src_lang_norm == tgt_lang_norm:
                return [{
                    'success': True,
                    'original': text,
                    'translated': text,
                    'source_language': src_lang_norm,
                    'target_language': tgt_lang_norm,
                    'message': 'No translation needed (same language)'
                } for text in texts]
            
            # Perform batch translation
            translated_texts = self.translator.translate(
                texts, 
                src_lang_norm, 
                tgt_lang_norm
            )
            
            results = []
            for i, (original, translated) in enumerate(zip(texts, translated_texts)):
                results.append({
                    'success': True,
                    'original': original,
                    'translated': translated,
                    'source_language': src_lang_norm,
                    'target_language': tgt_lang_norm
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Batch translation error: {e}")
            return [{
                'success': False,
                'original': text,
                'translated': text,  # Fallback to original
                'source_language': src_lang,
                'target_language': tgt_lang,
                'error': str(e)
            } for text in texts]
    
    def get_supported_languages(self) -> List[str]:
        """Get list of supported language codes"""
        return list(self.lang_mapping.keys())


def main():
    """Main function for command line usage"""
    # Set UTF-8 encoding for Windows
    if os.name == 'nt':  # Windows
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())
    
    if len(sys.argv) < 4:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python indictrans2_service.py <text> <src_lang> <tgt_lang>'
        }))
        sys.exit(1)
    
    text = sys.argv[1]
    src_lang = sys.argv[2] if len(sys.argv) > 2 else 'en'
    tgt_lang = sys.argv[3] if len(sys.argv) > 3 else 'hi'
    
    try:
        service = IndicTrans2Service()
        result = service.translate_text(text, src_lang, tgt_lang)
        print(json.dumps(result, ensure_ascii=False, indent=None))
        
    except Exception as e:
        error_result = {
            'success': False,
            'original': text,
            'translated': text,
            'error': str(e)
        }
        print(json.dumps(error_result, ensure_ascii=False))
        sys.exit(1)


if __name__ == '__main__':
    main()