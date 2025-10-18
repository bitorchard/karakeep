# AI Extraction Enhancement - Test Prompts

This document contains sample prompts to test the new AI extraction capabilities in Karakeep.

## Changes Made

### 1. Database Schema
- Added `aiExtractions` JSON field to the `bookmarks` table
- This field stores all AI-extracted data as a flexible JSON object

### 2. Prompt System
- **Changed from augmentation to complete override**: Custom prompts now completely replace the default prompt instead of being appended to it
- Increased max prompt length from 500 to 10,000 characters to accommodate comprehensive extraction prompts
- Prompts can now return any JSON structure, not just tags

### 3. Backend Processing
- Updated inference logic to accept and store arbitrary JSON fields from AI responses
- Still extracts "tags" field for backward compatibility with existing UI
- Stores complete AI response in `aiExtractions` field

### 4. Frontend
- Updated AI Settings UI to show that prompts now override completely (not augment)
- Changed input from single-line to multi-line textarea for longer prompts
- Created `AIExtractionsDisplay` component to show all extracted fields dynamically
- Integrated display component into bookmark preview

## Test Prompts

### Basic Test Prompt (Tags Only)
Use this to verify backward compatibility:

```
Analyze the TEXT_CONTENT and extract relevant tags.
Return JSON with a "tags" field containing an array of 3-5 relevant tags.

Example: {"tags": ["technology", "AI", "machine learning"]}

Respond ONLY with valid JSON.
```

### Comprehensive Extraction Prompt
Use this to test all the new extraction capabilities:

```
You are an expert content analyzer for a read-it-later app. Analyze the TEXT_CONTENT below and extract structured information.

Extract the following information and return as JSON:
- tags: Array of 3-5 general topic tags (strings)
- people: Array of person names mentioned (strings)
- organizations: Array of companies, institutions, or organizations (strings)
- locations: Array of places or geographic locations (strings)
- events: Array of specific events mentioned (strings)
- projects: Array of projects, products, or initiatives (strings)
- dates: Array of important dates or time periods (strings)
- deadlines: Array of any deadlines mentioned (strings)
- relationships: Array of key relationships described (strings)
- intent: Primary intent or purpose of the content (string: "informational", "commercial", "educational", "entertainment", "news", "opinion", "tutorial", "reference")
- topics: Array of specific technical or domain topics (strings)
- sentiment: Overall sentiment (string: "positive", "negative", "neutral", "mixed")
- actionItems: Array of any action items or tasks implied (strings)

Return ONLY valid JSON. If a field has no relevant data, use an empty array [] or null.

Example:
{
  "tags": ["artificial intelligence", "technology", "research"],
  "people": ["Geoffrey Hinton", "Yann LeCun"],
  "organizations": ["OpenAI", "Google DeepMind"],
  "locations": ["Silicon Valley"],
  "events": ["NeurIPS 2024"],
  "projects": ["GPT-4", "Claude"],
  "dates": ["2024"],
  "deadlines": [],
  "relationships": ["researcher-institution"],
  "intent": "informational",
  "topics": ["neural networks", "deep learning", "transformers"],
  "sentiment": "positive",
  "actionItems": []
}
```

### Minimal Extraction Prompt
Use this for faster processing with fewer fields:

```
Analyze the TEXT_CONTENT and extract:
- tags: 3-5 topic tags (array of strings)
- people: Person names (array of strings)
- organizations: Companies/institutions (array of strings)
- topics: Key topics (array of strings)
- intent: Content purpose (string)

Return ONLY valid JSON.
```

### Meeting Notes Extraction Prompt
Specialized for meeting notes:

```
Analyze the TEXT_CONTENT as meeting notes and extract:
- tags: Meeting type tags (array of strings)
- people: Attendees (array of strings)
- organizations: Companies discussed (array of strings)
- dates: Dates mentioned (array of strings)
- deadlines: Due dates (array of strings)
- actionItems: Tasks assigned (array of strings)
- decisions: Decisions made (array of strings)
- nextSteps: Next steps (array of strings)

Return ONLY valid JSON.
```

### Research Paper Extraction Prompt
Specialized for academic papers:

```
Analyze the TEXT_CONTENT as a research paper and extract:
- tags: Research area tags (array of strings)
- people: Authors and cited researchers (array of strings)
- organizations: Institutions and labs (array of strings)
- topics: Technical topics and methods (array of strings)
- findings: Key findings (array of strings)
- methodology: Methods used (array of strings)
- datasets: Datasets mentioned (array of strings)
- metrics: Performance metrics (array of strings)

Return ONLY valid JSON.
```

## Testing Steps

1. **Navigate to AI Settings**
   - Go to Dashboard → Settings → AI Settings
   - Notice the updated description about complete prompt override

2. **Add a Test Prompt**
   - Copy one of the prompts above
   - Paste into the textarea (should be multi-line now)
   - Select "text" for "Applies To"
   - Click "Add Prompt"

3. **Create or Update a Bookmark**
   - Create a new text bookmark or link bookmark
   - Wait for AI processing to complete (check taggingStatus)

4. **View Extracted Data**
   - Click on the bookmark to open preview
   - Look for the "AI Extractions" card below the summary
   - Verify all extracted fields are displayed properly
   - Tags should still work as before

5. **Test Different Prompts**
   - Try different prompts from above
   - Verify the extraction changes based on the prompt
   - Test with different content types (news articles, blog posts, technical docs)

## Expected Behavior

- ✅ Custom prompts completely override default prompts
- ✅ AI extractions display in a flexible card component
- ✅ Tags still appear in their original location
- ✅ Empty or null fields are not displayed
- ✅ Arrays are displayed as badges
- ✅ Objects are displayed as formatted JSON
- ✅ Field names are automatically formatted (camelCase → Title Case)

## Rollback Plan

If issues occur:
1. Delete the custom prompt in AI Settings
2. System will revert to default tag-only extraction
3. Existing `aiExtractions` data is preserved but not updated for new content

