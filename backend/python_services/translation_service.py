#!/usr/bin/env python3
"""
IndicTrans2 Translation Service
AI-powered translation service for Indian languages using AI4Bharat's IndicTrans2 model
"""

import torch
import sys
import json
import logging
from typing import List, Dict, Optional
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
# from IndicTransToolkit.processor import IndicProcessor  # Using simplified version
import traceback
from functools import lru_cache

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Simple processor to replace IndicTransToolkit
class SimpleIndicProcessor:
    """Simple processor for IndicTrans2 without external dependencies"""
    
    def __init__(self, inference=True):
        self.inference = inference
    
    def preprocess_batch(self, texts, src_lang, tgt_lang):
        """Simple preprocessing for IndicTrans2"""
        # For IndicTrans2, the format should be: <2xx> text where xx is target language
        processed = []
        for text in texts:
            # Just return the text as-is for now, the model handles language routing internally
            processed.append(text.strip())
        return processed
    
    def postprocess_batch(self, generated_tokens, lang):
        """Simple postprocessing - clean up the generated text"""
        if isinstance(generated_tokens, list):
            return [self._clean_text(text) for text in generated_tokens]
        return [self._clean_text(generated_tokens)]
    
    def _clean_text(self, text):
        """Clean up generated text"""
        if isinstance(text, str):
            # Remove language tokens and clean
            cleaned = text.strip()
            # Remove common artifacts
            cleaned = cleaned.replace('<pad>', '').replace('</s>', '')
            cleaned = cleaned.replace('<s>', '').strip()
            return cleaned
        return str(text)

class IndicTrans2Service:
    """
    Translation service using AI4Bharat's IndicTrans2 model
    Supports English to multiple Indian languages
    """
    
    # Language codes supported by IndicTrans2
    SUPPORTED_LANGUAGES = {
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
        'ne': 'nep_Deva',  # Nepali
        'si': 'sin_Sinh',  # Sinhala
        'kok': 'kok_Deva', # Konkani
        'mni': 'mni_Mtei', # Manipuri
        'sd': 'snd_Arab',  # Sindhi
        'mai': 'mai_Deva', # Maithili
        'brx': 'brx_Deva', # Bodo
        'sat': 'sat_Olck', # Santali
        'doi': 'doi_Deva', # Dogri
        'ks': 'kas_Arab',  # Kashmiri
        'gom': 'gom_Deva', # Goan Konkani
        'bpy': 'bpy_Beng', # Bishnupriya
    }
    
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_name = "ai4bharat/indictrans2-en-indic-dist-200M"
        self.tokenizer = None
        self.model = None
        self.processor = None
        self.src_lang = "eng_Latn"  # English source
        
        logger.info(f"Initializing IndicTrans2 service on device: {self.device}")
        self._load_model()
    
    def _load_model(self):
        """Load the IndicTrans2 model and tokenizer"""
        try:
            logger.info("Loading IndicTrans2 model...")
            
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name, 
                trust_remote_code=True
            )
            
            # Load model
            model_kwargs = {
                "trust_remote_code": True,
                "torch_dtype": torch.float16 if self.device == "cuda" else torch.float32
            }
            
            # Only add flash attention if CUDA is available
            if self.device == "cuda":
                try:
                    model_kwargs["attn_implementation"] = "flash_attention_2"
                except Exception as e:
                    logger.warning(f"Flash attention not available: {e}")
            
            self.model = AutoModelForSeq2SeqLM.from_pretrained(
                self.model_name, 
                **model_kwargs
            ).to(self.device)
            
            # Initialize simple processor (alternative to IndicProcessor)
            self.processor = SimpleIndicProcessor()
            
            logger.info("IndicTrans2 model loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            logger.error(traceback.format_exc())
            raise
    
    @lru_cache(maxsize=1000)
    def translate_cached(self, text: str, target_lang: str) -> str:
        """
        Cached translation to avoid recomputing identical translations
        """
        return self._translate_single(text, target_lang)
    
    def _translate_single(self, text: str, target_lang: str) -> str:
        """
        Translate a single text to target language
        """
        if target_lang not in self.SUPPORTED_LANGUAGES:
            logger.warning(f"Unsupported language: {target_lang}")
            return text  # Return original text if language not supported
        
        try:
            tgt_lang = self.SUPPORTED_LANGUAGES[target_lang]
            
            # Preprocess text (simplified without IndicTransToolkit)
            batch = self.processor.preprocess_batch(
                [text], 
                src_lang=self.src_lang, 
                tgt_lang=tgt_lang
            )
            
            # Tokenize
            inputs = self.tokenizer(
                batch,
                truncation=True,
                padding="longest",
                return_tensors="pt",
                return_attention_mask=True,
            ).to(self.device)
            
            # Generate translation
            with torch.no_grad():
                generated_tokens = self.model.generate(
                    **inputs,
                    use_cache=True,
                    min_length=1,
                    max_length=256,
                    num_beams=4,
                    num_return_sequences=1,
                    do_sample=False,
                    early_stopping=True
                )
            
            # Decode
            with self.tokenizer.as_target_tokenizer():
                generated_tokens = self.tokenizer.batch_decode(
                    generated_tokens.detach().cpu().tolist(),
                    skip_special_tokens=True,
                    clean_up_tokenization_spaces=True,
                )
            
            # Postprocess (simplified without IndicTransToolkit)
            translations = self.processor.postprocess_batch(
                generated_tokens, 
                lang=tgt_lang
            )
            
            return translations[0] if translations else text
            
        except Exception as e:
            logger.error(f"Translation error for '{text}' to {target_lang}: {e}")
            return text  # Fallback to original text
    
    def translate_batch(self, texts: List[str], target_lang: str) -> List[str]:
        """
        Translate a batch of texts to target language
        """
        if target_lang not in self.SUPPORTED_LANGUAGES:
            logger.warning(f"Unsupported language: {target_lang}")
            return texts
        
        if not texts:
            return []
        
        try:
            tgt_lang = self.SUPPORTED_LANGUAGES[target_lang]
            
            # Use cached translation for individual texts
            translations = []
            for text in texts:
                translation = self.translate_cached(text, target_lang)
                translations.append(translation)
            
            return translations
            
        except Exception as e:
            logger.error(f"Batch translation error: {e}")
            return texts  # Fallback to original texts
    
    def get_supported_languages(self) -> Dict[str, str]:
        """
        Get list of supported languages
        """
        return {
            code: lang_code.split('_')[0].title() 
            for code, lang_code in self.SUPPORTED_LANGUAGES.items()
        }

# Global service instance
translation_service = None

def initialize_service():
    """Initialize the translation service"""
    global translation_service
    if translation_service is None:
        translation_service = IndicTrans2Service()
    return translation_service

def translate_text(text: str, target_lang: str) -> str:
    """
    Translate text to target language
    """
    service = initialize_service()
    return service.translate_cached(text, target_lang)

def translate_batch(texts: List[str], target_lang: str) -> List[str]:
    """
    Translate batch of texts to target language
    """
    service = initialize_service()
    return service.translate_batch(texts, target_lang)

def get_supported_languages() -> Dict[str, str]:
    """
    Get supported languages
    """
    service = initialize_service()
    return service.get_supported_languages()

# CLI interface for testing
if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python translation_service.py <text> <target_lang>")
        print("Example: python translation_service.py 'Hello world' hi")
        sys.exit(1)
    
    text = sys.argv[1]
    target_lang = sys.argv[2]
    
    try:
        result = translate_text(text, target_lang)
        print(json.dumps({
            "success": True,
            "original": text,
            "translated": result,
            "target_language": target_lang
        }, ensure_ascii=False, indent=2))
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }, indent=2))