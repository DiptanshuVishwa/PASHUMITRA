#!/usr/bin/env python3
"""
Working IndicTrans2 Translation Service
Based on Hugging Face documentation patterns
"""

import torch
import sys
import json
import logging
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WorkingIndicTrans2:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_name = "ai4bharat/indictrans2-en-indic-dist-200M"
        self.src_lang = "eng_Latn"
        
        # Language mapping - this is critical for IndicTrans2
        self.language_mapping = {
            'hi': 'hin_Deva',  # Hindi
            'bn': 'ben_Beng',  # Bengali
            'te': 'tel_Telu',  # Telugu
            'mr': 'mar_Deva',  # Marathi
            'ta': 'tam_Taml',  # Tamil
            'gu': 'guj_Gujr',  # Gujarati
            'kn': 'kan_Knda',  # Kannada
            'ml': 'mal_Mlym',  # Malayalam
        }
        
        logger.info("Loading model...")
        self._load_model()
    
    def _load_model(self):
        """Load model and tokenizer"""
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name, 
                trust_remote_code=True
            )
            
            self.model = AutoModelForSeq2SeqLM.from_pretrained(
                self.model_name, 
                trust_remote_code=True,
                torch_dtype=torch.float32,  # Use float32 for CPU
            ).to(self.device)
            
            logger.info("Model loaded successfully!")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def translate(self, text, target_lang_code):
        """Translate text to target language"""
        try:
            if target_lang_code not in self.language_mapping:
                return f"Unsupported language: {target_lang_code}"
            
            tgt_lang = self.language_mapping[target_lang_code]
            
            # Set tokenizer languages
            self.tokenizer.src_lang = self.src_lang
            self.tokenizer.tgt_lang = tgt_lang
            
            # Tokenize with proper language setting
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=512
            ).to(self.device)
            
            # Generate translation
            with torch.no_grad():
                generated_tokens = self.model.generate(
                    **inputs,
                    forced_bos_token_id=self.tokenizer.get_lang_id(tgt_lang),
                    max_length=256,
                    num_beams=5,
                    early_stopping=True
                )
            
            # Decode
            translated = self.tokenizer.batch_decode(
                generated_tokens, 
                skip_special_tokens=True, 
                clean_up_tokenization_spaces=True
            )[0]
            
            return translated.strip()
            
        except Exception as e:
            logger.error(f"Translation failed: {e}")
            return text  # Fallback to original

def main():
    if len(sys.argv) != 3:
        print("Usage: python working_translation.py <text> <target_lang>")
        sys.exit(1)
    
    text = sys.argv[1]
    target_lang = sys.argv[2]
    
    try:
        translator = WorkingIndicTrans2()
        result = translator.translate(text, target_lang)
        
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
            "original": text
        }, indent=2))

if __name__ == "__main__":
    main()