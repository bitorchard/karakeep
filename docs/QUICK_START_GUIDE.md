# Quick Start Guide - AI Extraction Enhancement

## What Changed?

Karakeep now supports comprehensive AI extraction beyond just tags. You can now extract people, organizations, locations, events, projects, dates, deadlines, relationships, intent, topics, and much more from your saved content.

**Important**: Custom prompts now **completely override** the default prompt (instead of augmenting it). This gives you full control to test different extraction schemas.

## Quick Setup (5 minutes)

### Step 1: Apply Database Migration

The system needs a new database field. You'll need to run:

```bash
# Option 1: If pnpm is available
pnpm db:migrate

# Option 2: Manual migration
# The migration file is already created at:
# packages/db/drizzle/0064_add_ai_extractions.sql
# Apply it to your database manually if needed
```

### Step 2: Add a Custom Prompt

1. Navigate to: **Dashboard → Settings → AI Settings**

2. Copy the prompt from `RECOMMENDED_COMPREHENSIVE_PROMPT.txt` (in the root directory)

3. Paste it into the large textarea

4. Select **"text"** for "Applies To"

5. Click **"Add Prompt"**

### Step 3: Test It

1. **Create a test bookmark:**
   - Go to Dashboard
   - Click "Add Bookmark"
   - Choose "Text" type
   - Paste this sample content:

   ```
   OpenAI announced GPT-4 Turbo at their DevDay conference in San Francisco on November 6, 2023. 
   The new model features a 128K context window and improved performance. CEO Sam Altman demonstrated 
   several new features including better instruction following and reduced hallucinations. 
   The company also introduced Custom GPTs, allowing users to create specialized versions of ChatGPT. 
   Pricing was reduced to $0.01 per 1K input tokens. Developers can start using the new API immediately. 
   Microsoft, OpenAI's primary investor, will integrate these features into Azure OpenAI Service.
   ```

2. **Wait for processing:**
   - The bookmark will show "pending" status initially
   - Wait 10-30 seconds for AI processing
   - Refresh if needed

3. **View extractions:**
   - Click on the bookmark to open preview
   - Scroll down past the summary
   - You should see an "**AI Extractions**" card with:
     - Tags
     - People (Sam Altman)
     - Organizations (OpenAI, Microsoft)
     - Locations (San Francisco)
     - Events (DevDay conference)
     - Projects (GPT-4 Turbo, ChatGPT, Custom GPTs)
     - Dates (November 6, 2023, 2023)
     - Topics (API, Azure OpenAI Service)
     - Intent (news)
     - Sentiment (positive)
     - And more!

## Customizing Your Prompt

### Start Simple

If the comprehensive prompt is too much, start with a minimal one:

```
Analyze the TEXT_CONTENT and extract:
- tags: 3-5 topic tags (array of strings)
- people: Person names (array of strings)  
- organizations: Companies/institutions (array of strings)
- intent: Content purpose (string)

Return ONLY valid JSON with these fields.
```

### JSON Format is Critical

Your prompt MUST instruct the AI to return valid JSON with at least a "tags" field:

```json
{
  "tags": ["example", "tags"],
  "yourCustomField": ["any", "data"],
  "anotherField": "single value"
}
```

### Test Different Content Types

Try prompts specialized for:
- **Meeting notes**: Extract attendees, action items, decisions
- **Research papers**: Extract authors, methodology, findings
- **News articles**: Extract events, people, organizations
- **Technical docs**: Extract technologies, concepts, code examples

See `AI_EXTRACTION_TEST_PROMPTS.md` for more examples.

## Verifying Everything Works

### ✅ Checklist

- [ ] Database migration completed successfully
- [ ] Custom prompt added in AI Settings (you'll see it listed)
- [ ] Test bookmark created
- [ ] Bookmark shows taggingStatus: "success"
- [ ] Tags appear in the traditional tags section
- [ ] "AI Extractions" card appears in bookmark preview
- [ ] Extracted fields display correctly (as badges for arrays, text for strings)
- [ ] Empty fields don't show up in the display

### 🐛 Troubleshooting

**Problem**: AI Extractions card doesn't appear
- Check if taggingStatus is "success" (not "pending" or "failure")
- Check browser console for errors
- Verify the bookmark has content to analyze

**Problem**: Getting parsing errors
- Make sure your prompt explicitly says "Return ONLY valid JSON"
- Add example JSON format in your prompt
- Don't ask for markdown code blocks

**Problem**: Tags not appearing
- Ensure your prompt includes a "tags" field
- Tags must be an array of strings

**Problem**: Some fields not extracting
- Content might not have that information
- Make your prompt more explicit about what to look for
- Try different content that definitely has those entities

## Next Steps

1. **Experiment with prompts**: Try the examples in `AI_EXTRACTION_TEST_PROMPTS.md`

2. **Monitor results**: Check which fields are most useful for your use case

3. **Refine your prompt**: Adjust based on what works best for your content

4. **Share feedback**: Note any issues or ideas for improvement

## Important Notes

- **Backward Compatible**: Existing bookmarks and tags continue to work
- **Optional Feature**: You don't need to use custom prompts - default tagging still works
- **Flexible Output**: The system accepts any JSON structure you define
- **Multiple Prompts**: You can have different prompts for text, images, and summary

## Files Created

- `COMPREHENSIVE_CHANGES_SUMMARY.md` - Detailed technical changes
- `AI_EXTRACTION_TEST_PROMPTS.md` - Multiple test prompt examples
- `RECOMMENDED_COMPREHENSIVE_PROMPT.txt` - Production-ready comprehensive prompt
- `QUICK_START_GUIDE.md` - This file

## Getting Help

If something doesn't work:
1. Check the troubleshooting section above
2. Review the test prompts document for working examples
3. Check the changes summary for technical details
4. Verify the database migration completed

