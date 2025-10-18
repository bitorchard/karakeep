import { getEncoding } from "js-tiktoken";

const encoding = getEncoding("o200k_base");

/**
 * Remove duplicate whitespaces to avoid tokenization issues
 */
function preprocessContent(content: string) {
  return content.replace(/(\s){10,}/g, "$1");
}

function calculateNumTokens(text: string) {
  return encoding.encode(text).length;
}

function truncateContent(content: string, length: number) {
  const tokens = encoding.encode(content);
  const truncatedTokens = tokens.slice(0, length);
  return encoding.decode(truncatedTokens);
}

export function buildImagePrompt(lang: string, customPrompts: string[]) {
  // If there's a custom prompt, use it completely (override mode)
  if (customPrompts && customPrompts.length > 0) {
    return customPrompts[0];
  }
  
  // Default prompt when no custom prompts are provided
  return `
You are an expert whose responsibility is to help with automatic text tagging for a read-it-later app.
Please analyze the attached image and suggest relevant tags that describe its key themes, topics, and main ideas. The rules are:
- Aim for a variety of tags, including broad categories, specific keywords, and potential sub-genres.
- The tags must be in ${lang}.
- If the tag is not generic enough, don't include it.
- Aim for 10-15 tags.
- If there are no good tags, don't emit any.
You must respond in valid JSON with the key "tags" and the value is list of tags. Don't wrap the response in a markdown code.`;
}

export function buildTextPrompt(
  lang: string,
  customPrompts: string[],
  content: string,
  contextLength: number,
) {
  content = preprocessContent(content);
  
  // If there's a custom prompt, use it completely (override mode)
  if (customPrompts && customPrompts.length > 0) {
    // Use the first custom prompt as the complete override
    const customPrompt = customPrompts[0];
    const constructPrompt = (c: string) => `${customPrompt}

<TEXT_CONTENT>
${c}
</TEXT_CONTENT>`;
    
    const promptSize = calculateNumTokens(constructPrompt(""));
    const truncatedContent = truncateContent(content, contextLength - promptSize);
    return constructPrompt(truncatedContent);
  }
  
  // Default prompt when no custom prompts are provided
  const constructPrompt = (c: string) => `
You are an expert entity extraction system for a personal knowledge management (PKM) database. Your task is to analyze text and extract structured entities according to the following schema.

=== COMPLETE SCHEMA ===

{
  "Person": {
    "purpose": "Track people in your network",
    "primary_key": "name",
    "attributes": {
      "name": {"type": "string", "required": true},
      "phone": {"type": "phone", "required": false},
      "email": {"type": "email", "required": false},
      "company": {"type": "string", "required": false},
      "job_title": {"type": "string", "required": false},
      "birthday": {"type": "date", "required": false},
      "where_met": {"type": "relation", "target": "Place", "fallback": "string", "required": false},
      "when_met": {"type": "date", "required": false},
      "last_talked": {"type": "date", "required": false},
      "next_checkin": {"type": "date", "required": false},
      "notes": {"type": "text", "required": false},
      "tags": {"type": "multi_select", "options": ["friend", "family", "work", "neighbor", "service"], "required": false}
    }
  },
  "Meeting": {
    "purpose": "Log interactions with people",
    "primary_key": ["title", "date"],
    "attributes": {
      "title": {"type": "string", "required": true},
      "date": {"type": "date", "required": true},
      "location": {"type": "relation", "target": "Place", "fallback": "string", "required": false},
      "people": {"type": "relation", "target": "Person", "multiple": true, "required": false},
      "what_discussed": {"type": "text", "required": false},
      "decisions": {"type": "text", "required": false},
      "todos": {"type": "text", "required": false},
      "follow_up_needed": {"type": "boolean", "required": false},
      "follow_up_by": {"type": "date", "required": false}
    }
  },
  "Place": {
    "purpose": "Track locations you visit or reference",
    "primary_key": "name",
    "attributes": {
      "name": {"type": "string", "required": true},
      "address": {"type": "string", "required": false},
      "category": {"type": "select", "options": ["restaurant", "cafe", "office", "store", "gym", "home"], "required": false},
      "phone": {"type": "phone", "required": false},
      "website": {"type": "url", "required": false},
      "hours": {"type": "string", "required": false},
      "parking_notes": {"type": "text", "required": false},
      "why_go_there": {"type": "text", "required": false},
      "last_visited": {"type": "date", "required": false},
      "rating": {"type": "number", "min": 1, "max": 5, "required": false}
    }
  },
  "Task": {
    "purpose": "Track actionable items",
    "primary_key": "title",
    "attributes": {
      "title": {"type": "string", "required": true},
      "due_date": {"type": "date", "required": false},
      "assigned_to": {"type": "relation", "target": "Person", "required": false},
      "for_project": {"type": "relation", "target": "Project", "required": false},
      "status": {"type": "select", "options": ["todo", "doing", "done", "cancelled"], "default": "todo", "required": true},
      "priority": {"type": "select", "options": ["now", "soon", "later"], "required": false},
      "notes": {"type": "text", "required": false},
      "time_needed": {"type": "string", "required": false}
    }
  },
  "Project": {
    "purpose": "Group related work or initiatives",
    "primary_key": "name",
    "attributes": {
      "name": {"type": "string", "required": true},
      "status": {"type": "select", "options": ["planning", "active", "paused", "done"], "required": true},
      "why": {"type": "text", "required": false},
      "deadline": {"type": "date", "required": false},
      "owner": {"type": "relation", "target": "Person", "required": false},
      "team": {"type": "relation", "target": "Person", "multiple": true, "required": false},
      "budget": {"type": "number", "currency": true, "required": false},
      "spent": {"type": "number", "currency": true, "required": false},
      "notes": {"type": "text", "required": false}
    }
  },
  "Note": {
    "purpose": "Capture thoughts, ideas, and reference material",
    "primary_key": "title",
    "attributes": {
      "title": {"type": "string", "required": true},
      "created": {"type": "date", "auto_set": true, "required": true},
      "category": {"type": "select", "options": ["idea", "journal", "reference", "learning"], "required": false},
      "topics": {"type": "tags", "required": false},
      "related_to": {"type": "relation", "target": "any", "multiple": true, "required": false},
      "content": {"type": "blocks", "required": false}
    }
  },
  "Event": {
    "purpose": "Track upcoming and past events",
    "primary_key": ["name", "date"],
    "attributes": {
      "name": {"type": "string", "required": true},
      "date": {"type": "date", "required": true},
      "time": {"type": "string", "required": false},
      "location": {"type": "relation", "target": "Place", "fallback": "string", "required": false},
      "attendees": {"type": "relation", "target": "Person", "multiple": true, "required": false},
      "cost": {"type": "number", "currency": true, "required": false},
      "tickets_link": {"type": "url", "required": false},
      "reminder": {"type": "date", "required": false},
      "notes": {"type": "text", "required": false}
    }
  },
  "Receipt": {
    "purpose": "Track purchases and expenses",
    "primary_key": ["store_name", "date"],
    "attributes": {
      "store_name": {"type": "string", "required": true},
      "date": {"type": "date", "required": true},
      "amount": {"type": "number", "currency": true, "required": true},
      "category": {"type": "select", "options": ["food", "transport", "shopping", "entertainment", "health", "utilities", "other"], "required": false},
      "payment_method": {"type": "select", "options": ["cash", "credit", "debit", "venmo", "paypal"], "required": false},
      "items_bought": {"type": "text", "required": false},
      "for_project": {"type": "relation", "target": "Project", "required": false},
      "reimbursable": {"type": "boolean", "required": false},
      "reimbursed": {"type": "boolean", "required": false},
      "photo": {"type": "file", "accept": "image/*,application/pdf", "required": false},
      "tax_deductible": {"type": "boolean", "required": false},
      "notes": {"type": "text", "required": false}
    }
  },
  "Subscription": {
    "purpose": "Track recurring payments",
    "primary_key": "service_name",
    "attributes": {
      "service_name": {"type": "string", "required": true},
      "cost_per_month": {"type": "number", "currency": true, "required": true},
      "billing_cycle": {"type": "select", "options": ["monthly", "yearly", "weekly"], "required": true},
      "next_payment": {"type": "date", "required": false},
      "payment_method": {"type": "select", "options": ["credit", "debit", "bank", "paypal"], "required": false},
      "category": {"type": "select", "options": ["streaming", "software", "gym", "news", "cloud", "other"], "required": false},
      "shared_with": {"type": "relation", "target": "Person", "multiple": true, "required": false},
      "cancel_by": {"type": "date", "required": false},
      "auto_renews": {"type": "boolean", "required": false},
      "login_email": {"type": "string", "required": false}
    }
  },
  "Account": {
    "purpose": "Track financial accounts",
    "primary_key": "name",
    "attributes": {
      "name": {"type": "string", "required": true},
      "type": {"type": "select", "options": ["checking", "savings", "credit", "investment", "loan"], "required": true},
      "bank_name": {"type": "string", "required": false},
      "account_number_last4": {"type": "string", "required": false},
      "current_balance": {"type": "number", "currency": true, "required": false},
      "last_updated": {"type": "date", "required": false},
      "interest_rate": {"type": "number", "percentage": true, "required": false},
      "notes": {"type": "text", "required": false}
    }
  },
  "Income": {
    "purpose": "Track money received",
    "primary_key": ["source", "date"],
    "attributes": {
      "source": {"type": "string", "required": true},
      "amount": {"type": "number", "currency": true, "required": true},
      "date_received": {"type": "date", "required": true},
      "type": {"type": "select", "options": ["salary", "freelance", "gift", "refund", "investment", "other"], "required": false},
      "for_work": {"type": "relation", "target": "Project", "required": false},
      "tax_withheld": {"type": "number", "currency": true, "required": false},
      "notes": {"type": "text", "required": false}
    }
  },
  "Book": {
    "purpose": "Track reading list and history",
    "primary_key": "title",
    "attributes": {
      "title": {"type": "string", "required": true},
      "author": {"type": "string", "required": false},
      "status": {"type": "select", "options": ["want", "reading", "finished", "abandoned"], "required": false},
      "started_date": {"type": "date", "required": false},
      "finished_date": {"type": "date", "required": false},
      "rating": {"type": "number", "min": 1, "max": 5, "required": false},
      "notes": {"type": "text", "required": false},
      "recommended_by": {"type": "relation", "target": "Person", "required": false},
      "recommend_to": {"type": "relation", "target": "Person", "multiple": true, "required": false}
    }
  },
  "Movie": {
    "purpose": "Track watched and want-to-watch movies",
    "primary_key": "title",
    "attributes": {
      "title": {"type": "string", "required": true},
      "watched_date": {"type": "date", "required": false},
      "where_watched": {"type": "select", "options": ["theater", "home", "plane"], "required": false},
      "watched_with": {"type": "relation", "target": "Person", "multiple": true, "required": false},
      "rating": {"type": "number", "min": 1, "max": 5, "required": false},
      "would_rewatch": {"type": "boolean", "required": false},
      "notes": {"type": "text", "required": false}
    }
  },
  "Meal": {
    "purpose": "Track memorable meals and recipes",
    "primary_key": ["name", "date"],
    "attributes": {
      "name": {"type": "string", "required": true},
      "date": {"type": "date", "required": true},
      "meal_type": {"type": "select", "options": ["breakfast", "lunch", "dinner", "snack"], "required": false},
      "where": {"type": "relation", "target": "Place", "fallback": "string", "required": false},
      "with_who": {"type": "relation", "target": "Person", "multiple": true, "required": false},
      "cost": {"type": "number", "currency": true, "required": false},
      "recipe_link": {"type": "url", "required": false},
      "rating": {"type": "number", "min": 1, "max": 5, "required": false},
      "make_again": {"type": "boolean", "required": false},
      "notes": {"type": "text", "required": false}
    }
  },
  "Gift": {
    "purpose": "Track gifts given and received",
    "primary_key": ["item", "for_person", "date"],
    "attributes": {
      "item": {"type": "string", "required": true},
      "for_person": {"type": "relation", "target": "Person", "required": true},
      "occasion": {"type": "select", "options": ["birthday", "holiday", "wedding", "baby", "thanks", "just_because"], "required": false},
      "date_given": {"type": "date", "required": false},
      "cost": {"type": "number", "currency": true, "required": false},
      "where_bought": {"type": "relation", "target": "Place", "fallback": "string", "required": false},
      "their_reaction": {"type": "text", "required": false},
      "gift_ideas_future": {"type": "text", "required": false}
    }
  },
  "Health": {
    "purpose": "Track health events and medical history",
    "primary_key": ["date", "type"],
    "attributes": {
      "date": {"type": "date", "required": true},
      "type": {"type": "select", "options": ["appointment", "symptom", "medication", "test", "workout"], "required": true},
      "provider": {"type": "relation", "target": "Person", "fallback": "string", "required": false},
      "location": {"type": "relation", "target": "Place", "required": false},
      "cost": {"type": "number", "currency": true, "required": false},
      "covered_by_insurance": {"type": "boolean", "required": false},
      "notes": {"type": "text", "required": false},
      "follow_up_needed": {"type": "date", "required": false}
    }
  },
  "Trip": {
    "purpose": "Track travel and vacations",
    "primary_key": ["destination", "start_date"],
    "attributes": {
      "destination": {"type": "string", "required": true},
      "start_date": {"type": "date", "required": true},
      "end_date": {"type": "date", "required": false},
      "purpose": {"type": "select", "options": ["vacation", "work", "family", "event"], "required": false},
      "travel_companions": {"type": "relation", "target": "Person", "multiple": true, "required": false},
      "transportation": {"type": "select", "options": ["car", "plane", "train", "bus"], "required": false},
      "accommodation": {"type": "text", "required": false},
      "total_cost": {"type": "number", "currency": true, "required": false},
      "highlights": {"type": "text", "required": false},
      "would_return": {"type": "boolean", "required": false}
    }
  },
  "Car_Service": {
    "purpose": "Track vehicle maintenance",
    "primary_key": ["date", "type"],
    "attributes": {
      "date": {"type": "date", "required": true},
      "type": {"type": "select", "options": ["oil", "tires", "repair", "inspection", "wash"], "required": true},
      "mileage": {"type": "number", "required": false},
      "location": {"type": "relation", "target": "Place", "fallback": "string", "required": false},
      "cost": {"type": "number", "currency": true, "required": false},
      "next_service_due": {"type": "date", "required": false},
      "notes": {"type": "text", "required": false}
    }
  },
  "Document": {
    "purpose": "Store important documents and files",
    "primary_key": "name",
    "attributes": {
      "name": {"type": "string", "required": true},
      "type": {"type": "select", "options": ["contract", "tax", "medical", "legal", "financial", "receipt"], "required": false},
      "date": {"type": "date", "required": false},
      "related_to": {"type": "relation", "target": ["Person", "Project"], "multiple": true, "required": false},
      "expiration_date": {"type": "date", "required": false},
      "file": {"type": "file", "required": false},
      "location_stored": {"type": "string", "required": false},
      "notes": {"type": "text", "required": false}
    }
  }
}

=== EXTRACTION RULES ===

### CORE PRINCIPLES ###
- Extract entities only when there is clear, explicit information
- Fill all mentioned attributes from the text
- Use relations when attributes reference other entities
- Resolve relative dates to ISO format YYYY-MM-DD
- Generate unique IDs using pattern: objecttype_identifier_date

### RELATION HANDLING ###
attributes with "type": "relation" should link to other entities.

When "fallback": "string" is specified:
- Try to create a relation if it's a specific named entity (e.g., "Blue Bottle Coffee" -> Place)
- Use string fallback for generic locations (e.g., "at home", "via Zoom", "online")

For ambiguous references where you cannot determine if they refer to an existing entity:
- Store as string value in the property
- Add a note in the entity's notes field mentioning the ambiguity
- Example: "Met Mike from platform team" -> store "Mike from platform team" as string, add note: "Mike may need to be linked to existing Person"

### RELATION FORMAT ###
Single relation: {"relation_type": "Person", "value": "John Smith"}
Multiple relations: [{"relation_type": "Person", "value": "Alice"}, {"relation_type": "Person", "value": "Bob"}]
Fallback string: "via Zoom"

### DATE RESOLUTION ###
Convert relative dates to ISO format based on extraction context date:
- "yesterday" -> subtract 1 day
- "today" -> current date
- "tomorrow" -> add 1 day
- "last Monday" -> most recent Monday
- "next Friday" -> upcoming Friday
- "in 3 months" -> add 90 days

### ENTITY EXTRACTION GUIDELINES ###
- Create separate entities for each distinct object mentioned
- If same entity mentioned multiple times, create once with complete info
- Extract action items as Task objects
- Create Place objects for specific named locations
- Create Person objects when full names or identifying context is provided
- Link related entities through relation attributes

### OUTPUT FORMAT ###
Return JSON with this structure:

{
  "entities": [
    {
      "type": "ObjectType",
      "id": "unique_identifier",
      "attributes": {
        "property_name": "value",
        "relation_property": {"relation_type": "Person", "value": "Name"}
      }
    }
  ],
  "metadata": {
    "extraction_date": "YYYY-MM-DD",
    "entities_extracted": 0
  }
}

=== EXAMPLES ===

### EXAMPLE 1: Meeting Note ###
INPUT: "Had lunch with Maria Gonzalez from Startup Inc. yesterday at Tasty Thai on Market Street. She's the new CTO and we met at the AI Summit last month. We discussed their ML infrastructure challenges. Action items: send her our architecture docs by Friday and introduce her to Mike from platform team."

OUTPUT:
{
  "entities": [
    {
      "type": "Person",
      "id": "person_maria_gonzalez",
      "attributes": {
        "name": "Maria Gonzalez",
        "company": "Startup Inc.",
        "job_title": "CTO",
        "where_met": {"relation_type": "Place", "value": "AI Summit"},
        "when_met": "2024-09-17",
        "tags": ["work"]
      }
    },
    {
      "type": "Place",
      "id": "place_tasty_thai",
      "attributes": {
        "name": "Tasty Thai",
        "address": "Market Street",
        "category": "restaurant"
      }
    },
    {
      "type": "Place",
      "id": "place_ai_summit",
      "attributes": {
        "name": "AI Summit",
        "category": "office"
      }
    },
    {
      "type": "Meeting",
      "id": "meeting_lunch_maria_20241016",
      "attributes": {
        "title": "Lunch with Maria Gonzalez",
        "date": "2024-10-16",
        "location": {"relation_type": "Place", "value": "Tasty Thai"},
        "people": [{"relation_type": "Person", "value": "Maria Gonzalez"}],
        "what_discussed": "ML infrastructure challenges",
        "todos": "Send architecture docs by Friday, introduce to Mike from platform team",
        "follow_up_needed": true,
        "follow_up_by": "2024-10-18"
      }
    },
    {
      "type": "Task",
      "id": "task_send_docs_maria",
      "attributes": {
        "title": "Send architecture docs to Maria",
        "due_date": "2024-10-18",
        "status": "todo",
        "priority": "now",
        "notes": "For Maria Gonzalez from Startup Inc."
      }
    },
    {
      "type": "Task",
      "id": "task_intro_mike_maria",
      "attributes": {
        "title": "Introduce Maria to Mike from platform team",
        "status": "todo",
        "priority": "soon",
        "notes": "Mike from platform team - may need to link to existing Person entity"
      }
    }
  ],
  "metadata": {
    "extraction_date": "2024-10-17",
    "entities_extracted": 6
  }
}

### EXAMPLE 2: Receipt and Meeting ###
INPUT: "Stopped by Target this morning and spent $124.87 on household stuff. Used my Amex. Also grabbed lunch at Chipotle for $12.50 cash. Ran into my neighbor Janet there, she recommended 'Atomic Habits'."

OUTPUT:
{
  "entities": [
    {
      "type": "Receipt",
      "id": "receipt_target_20241017",
      "attributes": {
        "store_name": "Target",
        "date": "2024-10-17",
        "amount": 124.87,
        "category": "shopping",
        "payment_method": "credit",
        "items_bought": "household stuff"
      }
    },
    {
      "type": "Receipt",
      "id": "receipt_chipotle_20241017",
      "attributes": {
        "store_name": "Chipotle",
        "date": "2024-10-17",
        "amount": 12.50,
        "category": "food",
        "payment_method": "cash"
      }
    },
    {
      "type": "Place",
      "id": "place_chipotle",
      "attributes": {
        "name": "Chipotle",
        "category": "restaurant"
      }
    },
    {
      "type": "Meeting",
      "id": "meeting_janet_chipotle_20241017",
      "attributes": {
        "title": "Ran into Janet at Chipotle",
        "date": "2024-10-17",
        "location": {"relation_type": "Place", "value": "Chipotle"},
        "people": [{"relation_type": "Person", "value": "Janet"}],
        "what_discussed": "She recommended Atomic Habits",
        "notes": "Janet is my neighbor - may need to link to existing Person entity"
      }
    },
    {
      "type": "Book",
      "id": "book_atomic_habits",
      "attributes": {
        "title": "Atomic Habits",
        "status": "want",
        "recommended_by": {"relation_type": "Person", "value": "Janet"}
      }
    }
  ],
  "metadata": {
    "extraction_date": "2024-10-17",
    "entities_extracted": 5
  }
}

### EXAMPLE 3: Health Appointment ###
INPUT: "Annual checkup with Dr. Sarah Chen at Valley Medical Center on Oct 10th. Everything looks good. BP 120/80, weight 165 lbs. Need cholesterol recheck in 3 months. Copay was $25."

OUTPUT:
{
  "entities": [
    {
      "type": "Person",
      "id": "person_dr_chen",
      "attributes": {
        "name": "Dr. Sarah Chen",
        "job_title": "Doctor",
        "tags": ["service"]
      }
    },
    {
      "type": "Place",
      "id": "place_valley_medical",
      "attributes": {
        "name": "Valley Medical Center",
        "category": "office"
      }
    },
    {
      "type": "Health",
      "id": "health_checkup_20241010",
      "attributes": {
        "date": "2024-10-10",
        "type": "appointment",
        "provider": {"relation_type": "Person", "value": "Dr. Sarah Chen"},
        "location": {"relation_type": "Place", "value": "Valley Medical Center"},
        "cost": 25.00,
        "covered_by_insurance": true,
        "notes": "Annual checkup. BP 120/80, weight 165 lbs. Everything looks good."
      }
    },
    {
      "type": "Task",
      "id": "task_cholesterol_followup",
      "attributes": {
        "title": "Schedule cholesterol recheck",
        "due_date": "2025-01-10",
        "status": "todo",
        "notes": "Follow-up from annual checkup with Dr. Chen"
      }
    }
  ],
  "metadata": {
    "extraction_date": "2024-10-17",
    "entities_extracted": 4
  }
}

=== SPECIAL HANDLING ===

Currency: Always use decimal format (25.00 not 25), no currency symbols
Phone: Extract as provided, preserve formatting
Dates: Always ISO format YYYY-MM-DD
Names: Extract full names when provided, partial names when that's all available
IDs: Use pattern objecttype_identifier_date in lowercase with underscores

=== CRITICAL RULES ===

1. When property has relation type, attempt to create relation to named entity
2. If entity reference is ambiguous or partial, store as string and note in entity notes field
3. Create Place objects for specific named locations
4. Extract all action items as Task objects
5. Link entities through relation attributes when clear connections exist
6. If same entity mentioned multiple times, extract once with all info
7. Always resolve relative dates to actual ISO dates
8. Generate descriptive unique IDs for each entity
9. Fill all attributes that are mentioned in the text
10. Be conservative - only extract when information is clear and explicit


<TEXT_CONTENT>
${c}
</TEXT_CONTENT>
Extract thoroughly and create rich connections between entities while maintaining data quality.`;

  const promptSize = calculateNumTokens(constructPrompt(""));
  const truncatedContent = truncateContent(content, contextLength - promptSize);
  return constructPrompt(truncatedContent);
}

export function buildSummaryPrompt(
  lang: string,
  customPrompts: string[],
  content: string,
  contextLength: number,
) {
  content = preprocessContent(content);
  
  // If there's a custom prompt, use it completely (override mode)
  if (customPrompts && customPrompts.length > 0) {
    const customPrompt = customPrompts[0];
    const constructPrompt = (c: string) => `${customPrompt}
    ${c}`;
    
    const promptSize = calculateNumTokens(constructPrompt(""));
    const truncatedContent = truncateContent(content, contextLength - promptSize);
    return constructPrompt(truncatedContent);
  }
  
  // Default prompt when no custom prompts are provided
  const constructPrompt = (c: string) => `
Summarize the following content responding ONLY with the summary. You MUST follow the following rules:
- Summary must be in 3-4 sentences.
- The summary must be in ${lang}.
    ${c}`;

  const promptSize = calculateNumTokens(constructPrompt(""));
  const truncatedContent = truncateContent(content, contextLength - promptSize);
  return constructPrompt(truncatedContent);
}
