/**
 * Utility to clean NVIDIA API responses
 * NVIDIA often wraps JSON in think tags like: {json}
 */

export function cleanNVIDIAResponse(response: string): string {
  let cleaned = response.trim();
  
  // Pattern to match anything between angle brackets (think tags)
  // We need to remove:  ...reasoning...  {json}
  // And extract just: {json}
  
  // Find the opening tag
  const openTagStart = cleaned.indexOf('<');
  if (openTagStart !== -1) {
    // Find the closing tag
    const closeTagEnd = cleaned.lastIndexOf('>');
    if (closeTagEnd !== -1) {
      // Extract everything after the last >
      const afterClosingTag = cleaned.substring(closeTagEnd + 1).trim();
      
      // If there's content after the closing tag, that's likely our JSON
      if (afterClosingTag.length > 0) {
        cleaned = afterClosingTag;
      }
    }
  }
  
  // Also remove markdown code blocks
  cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  return cleaned;
}

// Test the cleaner
if (require.main === module) {
  const testResponse = ' ...reasoning...  {"test": "value"}';
  console.log('Original:', testResponse);
  console.log('Cleaned:', cleanNVIDIAResponse(testResponse));
}
