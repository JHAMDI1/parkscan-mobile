/**
 * OCR Service using OCR.space free API
 * Free tier: 25,000 requests/month — no credit card needed
 * API key: Get your free key at https://ocr.space/ocrapi/freekey
 * The demo key "K88388957188957" works for testing
 */

const OCR_API_KEY = process.env.EXPO_PUBLIC_OCR_API_KEY || 'K88388957188957'; 
const OCR_API_URL = 'https://api.ocr.space/parse/image';

/**
 * Sends a local image URI to OCR.space and returns the full text found.
 * @param {string} imageUri - local file:// URI of the image
 * @returns {Promise<string>} - the raw OCR text
 */
export const readTextFromImage = async (imageUri) => {
  const formData = new FormData();
  formData.append('apikey', OCR_API_KEY);
  formData.append('language', 'eng');         // Latin numerals on Tunisian plates
  formData.append('isOverlayRequired', 'false');
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');
  formData.append('OCREngine', '2'); // Engine 2 is better for numbers/plates
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'plate.jpg',
  });

  const response = await fetch(OCR_API_URL, {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  if (!response.ok) {
    throw new Error(`OCR API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.IsErroredOnProcessing) {
    throw new Error(data.ErrorMessage?.[0] || 'OCR failed');
  }

  const text = data.ParsedResults?.[0]?.ParsedText || '';
  return text.trim();
};

import { ALL_BRANDS } from '../constants/brands';

/**
 * Smart parses OCR raw text to detect the type of plate and extract its values.
 * Returns { type, left, right, raw, brand }
 */
export const parseOcrResult = (rawText, currentTypeHint = '') => {
  let result = { type: 'أجنبية', left: '', right: '', raw: '', brand: '' };
  
  if (!rawText) return result;

  const cleanText = rawText.replace(/\n/g, ' ').trim();
  const digitsOnly = rawText.replace(/\D/g, ''); // Extract all digits sequentially
  const numberBlocks = rawText.match(/\d+/g) || [];
  
  // -- 1. Detect Car Brand --
  const upperText = rawText.toUpperCase();
  for (const b of ALL_BRANDS) {
    if (upperText.includes(b.toUpperCase())) {
      result.brand = b;
      break;
    }
  }
  
  // Some very common model mappings just in case the maker isn't written
  if (!result.brand) {
    if (upperText.includes('CORSA') || upperText.includes('ASTRA')) result.brand = 'Opel';
    else if (upperText.includes('CLIO') || upperText.includes('MEGANE')) result.brand = 'Renault';
    else if (upperText.includes('GOLF') || upperText.includes('POLO')) result.brand = 'Volkswagen';
    else if (upperText.includes('208') || upperText.includes('308')) result.brand = 'Peugeot';
    else if (upperText.includes('YARIS')) result.brand = 'Toyota';
  }

  // -- 2. Parse Number Plate --
  if (currentTypeHint === 'إدارية') {
     const longestBlock = [...numberBlocks].sort((a, b) => b.length - a.length)[0] || digitsOnly;
     result.type = 'إدارية';
     result.raw = longestBlock;
     return result;
  }

  if (currentTypeHint === 'أجنبية') {
     // Revert to full text because OCR might split valid characters onto different lines
     result.type = 'أجنبية';
     result.raw = cleanText;
     return result;
  }

  if (numberBlocks.length >= 2) {
    result.type = 'تونسية';
    result.right = numberBlocks[0];
    result.left = numberBlocks[1];
    result.raw = cleanText;
    return result;
  }

  if (digitsOnly.length >= 4 && digitsOnly.length <= 8) {
    const longestBlock = [...numberBlocks].sort((a, b) => b.length - a.length)[0] || digitsOnly;
    result.type = 'إدارية';
    result.raw = longestBlock;
    return result;
  }

  result.type = 'أجنبية';
  result.raw = cleanText;
  return result;
};
