#!/usr/bin/env python3
"""
Simple test for IndicTrans2 model
"""

import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

print("🧪 Testing IndicTrans2 Model...")

# Initialize
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {DEVICE}")

model_name = "ai4bharat/indictrans2-en-indic-dist-200M"

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)

print("Loading model...")
model = AutoModelForSeq2SeqLM.from_pretrained(
    model_name, 
    trust_remote_code=True,
    torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32
).to(DEVICE)

print("Model loaded successfully!")

# Test translation
input_text = "Hello, how are you today?"
print(f"Input: {input_text}")

# Simple tokenization
inputs = tokenizer(input_text, return_tensors="pt", padding=True, truncation=True).to(DEVICE)
print(f"Input IDs shape: {inputs.input_ids.shape}")

# Generate
print("Generating translation...")
with torch.no_grad():
    generated_tokens = model.generate(
        inputs.input_ids,
        attention_mask=inputs.attention_mask,
        max_length=128,
        num_beams=4,
        early_stopping=True,
        do_sample=False
    )

print(f"Generated tokens shape: {generated_tokens.shape}")

# Decode
decoded = tokenizer.decode(generated_tokens[0], skip_special_tokens=True, clean_up_tokenization_spaces=True)
print(f"Decoded output: {decoded}")

print("✅ Test complete!")