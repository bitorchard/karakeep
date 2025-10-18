# Langfuse Integration Guide

## Overview

Karakeep now integrates with [Langfuse](https://langfuse.com) for advanced AI prompt management, tracing, and evaluation. This integration enables you to:

- **Manage Prompts**: Store and version your extraction prompts in Langfuse
- **Trace Executions**: Automatically log every AI extraction with full context
- **Evaluate Outputs**: Review and score extraction quality in Langfuse
- **Iterate Faster**: Test different prompts without code changes

## Features

### 1. Automatic Tracing
Every AI extraction automatically creates a trace in Langfuse including:
- User ID and bookmark ID
- Bookmark type (link, text, asset)
- Prompt version used
- Model name
- Extracted entities (tags, people, organizations, etc.)
- Token usage (if available)

### 2. Prompt Management
Load prompts directly from Langfuse:
- Version control for prompts
- A/B test different extraction strategies
- Rollback to previous versions instantly
- Share prompts across team members

### 3. Evaluation Workflow
Use Langfuse's evaluation features to:
- Review extraction quality
- Score accuracy of entities
- Identify edge cases
- Build evaluation datasets

## Setup Instructions

### Step 0: Install Dependencies (First Time Only)

The Langfuse SDK is already included in `packages/shared/package.json`. Just run:

```bash
# From project root
pnpm install
```

This installs the dependency in the correct workspace package for the monorepo structure.

### Step 1: Get Langfuse API Keys

1. Sign up at [langfuse.com](https://langfuse.com) or deploy self-hosted
2. Create a new project
3. Navigate to Settings → API Keys
4. Copy your:
   - Public Key (starts with `pk-lf-`)
   - Secret Key (starts with `sk-lf-`)

### Step 2: Configure Karakeep

1. Navigate to **Settings → Langfuse**
2. Enable the Langfuse toggle
3. Paste your public key
4. Paste your secret key
5. (Optional) Set custom host for self-hosted instances
6. (Optional) Set prompt name to load from Langfuse
7. Click "Save Langfuse Settings"

### Step 3: Create a Prompt in Langfuse (Optional)

If you want to manage prompts in Langfuse:

1. In Langfuse, go to Prompts → Create New Prompt
2. Name it (e.g., "bookmark-extraction")
3. Add your prompt content. **Important**: Include `<TEXT_CONTENT>` placeholder
4. Example template:

```
You are an expert content analyzer. Extract structured information from the TEXT_CONTENT.

Extract these fields and return as JSON:
- tags: Array of 3-5 general topic tags
- people: Array of person names
- organizations: Array of companies/institutions
- locations: Array of places
- events: Array of named events
- projects: Array of projects/products
- dates: Array of dates/times
- deadlines: Array of deadlines
- relationships: Array of [subject, relationship, object] triples
- intent: Primary intent (string)
- topics: Array of specific topics

<TEXT_CONTENT>
Content will be inserted here automatically
</TEXT_CONTENT>

Return ONLY valid JSON.
```

5. Save and publish the prompt
6. Go back to Karakeep Settings → Langfuse
7. Enter the prompt name in "Prompt Name" field
8. Save settings

## How It Works

### Without Langfuse Prompt

1. User creates/updates bookmark
2. AI worker fetches user's Langfuse settings
3. Initializes Langfuse client (if enabled)
4. Creates trace in Langfuse
5. Uses local custom prompt or default prompt
6. Runs AI extraction
7. Records generation in Langfuse with:
   - Input (bookmark metadata)
   - Output (extracted entities)
   - Model used
   - Prompt version
8. Saves extractions to database
9. Flushes Langfuse data

### With Langfuse Prompt

Same flow, but step 5 changes:
- Fetches prompt from Langfuse by name
- Uses latest version automatically
- Replaces `<TEXT_CONTENT>` with actual content
- Records prompt version in trace

## Viewing Traces in Langfuse

1. Log into your Langfuse project
2. Go to "Traces" tab
3. Find traces named "bookmark-tagging"
4. Click to view details:
   - Full timeline of extraction
   - Input/output data
   - Model and tokens
   - Metadata (bookmark ID, user ID, extracted fields)

## Evaluating Extractions

### Manual Evaluation

1. Open a trace in Langfuse
2. Review the extracted entities
3. Click "Add Score" 
4. Score dimensions like:
   - Accuracy (0-1)
   - Completeness (0-1)
   - Relevance (0-1)
5. Add comments about what was missed or incorrect

### Automated Evaluation

Create eval functions in Langfuse to automatically score:
- Tag relevance
- Entity extraction accuracy
- Relationship correctness
- JSON format compliance

## Prompt Iteration Workflow

1. **Baseline**: Start with default or custom prompt
2. **Trace**: Run extractions, traces go to Langfuse
3. **Review**: Examine traces in Langfuse, find issues
4. **Edit**: Update prompt in Langfuse (new version created)
5. **Test**: Create new bookmarks, they use new prompt automatically
6. **Compare**: Langfuse shows metrics across prompt versions
7. **Iterate**: Repeat until satisfied
8. **Roll back**: If new version is worse, select previous version

## Advanced: Prompt Variables

Langfuse supports variables in prompts using `{{variable}}` syntax:

```
Extract information for {{bookmark_type}} content.

<TEXT_CONTENT>
{{content}}
</TEXT_CONTENT>
```

Currently, Karakeep passes:
- `content`: The actual text content

Future versions may support more variables.

## Troubleshooting

### Traces Not Appearing

**Problem**: Enabled Langfuse but no traces in dashboard

**Solutions**:
1. Verify API keys are correct
2. Check Langfuse host is correct (use https://cloud.langfuse.com for cloud)
3. Look at worker logs for Langfuse errors
4. Ensure bookmarks are being created/updated (triggers inference)
5. Wait a few moments - traces are async

### Prompt Not Loading

**Problem**: Set prompt name but using default prompt

**Solutions**:
1. Verify prompt exists in Langfuse
2. Check prompt name matches exactly (case-sensitive)
3. Ensure prompt is published (not draft)
4. Check worker logs for "Loaded prompt" message
5. Verify prompt includes `<TEXT_CONTENT>` placeholder

### API Key Errors

**Problem**: "Invalid API key" or "Unauthorized"

**Solutions**:
1. Regenerate keys in Langfuse
2. Copy-paste carefully (no extra spaces)
3. Ensure public key starts with `pk-lf-`
4. Ensure secret key starts with `sk-lf-`
5. Check project is not disabled

### Self-Hosted Issues

**Problem**: Can't connect to self-hosted Langfuse

**Solutions**:
1. Include protocol in host: `https://langfuse.yourdomain.com`
2. Don't include trailing slash
3. Ensure instance is accessible from worker
4. Check firewall rules
5. Verify SSL certificate if using HTTPS

## Performance Considerations

### Minimal Overhead

Langfuse integration adds minimal latency:
- Trace creation: ~5-10ms
- Generation recording: ~10-20ms
- Prompt fetching: ~50-100ms (cached after first fetch)

### Async Operations

All Langfuse operations are async and don't block:
- Traces are sent in background
- Failures don't affect extraction
- Automatic retry on network issues

### Data Privacy

- All data sent over HTTPS
- Only you have access to your Langfuse project
- Can use self-hosted Langfuse for full control
- API keys stored encrypted in database

## Example Use Cases

### 1. Research Paper Extraction

**Prompt in Langfuse**:
```
Extract academic paper metadata from TEXT_CONTENT:
- tags: research areas
- people: authors and cited researchers  
- organizations: institutions
- topics: technical concepts
- dates: publication date
- projects: mentioned datasets/systems

Return JSON.
```

**Result**: Automatic extraction of paper metadata, traceable in Langfuse

### 2. Meeting Notes

**Prompt in Langfuse**:
```
Extract meeting information:
- people: attendees
- organizations: companies discussed
- dates: mentioned dates
- deadlines: action item due dates
- relationships: who reports to whom
- topics: discussion topics

Return JSON.
```

**Result**: Structured meeting data, evaluate accuracy in Langfuse

### 3. News Articles

**Prompt in Langfuse**:
```
Extract news article entities:
- people: mentioned individuals
- organizations: companies and institutions
- locations: places
- events: significant events
- dates: when events occurred
- topics: article topics

Return JSON.
```

**Result**: Entity extraction from news, compare across articles

## Best Practices

### 1. Prompt Design
- Always include `<TEXT_CONTENT>` placeholder
- Be specific about JSON structure
- Include examples in prompt
- Specify data types clearly
- Handle edge cases explicitly

### 2. Evaluation
- Review traces regularly
- Score representative samples
- Build evaluation dataset
- Track metrics over time
- Document failure patterns

### 3. Iteration
- Start with simple prompts
- Add complexity gradually
- Test with diverse content
- Compare versions objectively
- Roll back if performance degrades

### 4. Organization
- Use descriptive prompt names
- Version prompts semantically (v1, v2, etc.)
- Add comments in Langfuse
- Tag traces by content type
- Set up alerts for failures

## API Reference

### Langfuse Trace Structure

```typescript
{
  name: "bookmark-tagging",
  userId: "user_123",
  metadata: {
    bookmarkId: "bookmark_456",
    bookmarkType: "link",
    promptVersion: "langfuse-v3"
  }
}
```

### Langfuse Generation Structure

```typescript
{
  name: "bookmark-extraction",
  input: {
    bookmarkId: "bookmark_456",
    bookmarkType: "link",
    promptVersion: "langfuse-v3"
  },
  output: {
    tags: ["ai", "technology"],
    people: ["sam-altman"],
    // ... other extracted fields
  },
  model: "gpt-4",
  metadata: {
    tags: ["ai", "technology"],
    extractionFields: ["tags", "people", "organizations"]
  }
}
```

## Migration Guide

### From Local Prompts to Langfuse

1. Copy your current custom prompt from AI Settings
2. Create new prompt in Langfuse with same content
3. Add `<TEXT_CONTENT>` placeholder if not present
4. Test with a few bookmarks
5. Compare extractions
6. If satisfied, set prompt name in Karakeep
7. Remove local custom prompt (optional)

### From Langfuse Back to Local

1. Copy prompt text from Langfuse
2. Remove `<TEXT_CONTENT>` placeholder
3. Add to AI Settings as custom prompt
4. Clear prompt name in Langfuse settings
5. Test extractions
6. Disable Langfuse if not using tracing

## Support and Resources

- **Langfuse Docs**: https://langfuse.com/docs
- **Langfuse Discord**: https://discord.gg/7NXusRtqYU
- **Example Prompts**: See `IMPROVED_DEFAULT_PROMPT.txt` and `RECOMMENDED_COMPREHENSIVE_PROMPT.txt`
- **Karakeep AI Docs**: See `AI_EXTRACTION_TEST_PROMPTS.md`

## Future Enhancements

Potential future features:
- Dataset creation from traces
- Automated A/B testing
- Custom evaluation metrics
- Batch prompt updates
- Cost tracking
- Performance analytics
- Collaborative prompt editing

