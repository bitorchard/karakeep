import { describe, it, expect } from "vitest";
import { z } from "zod";

const entitySchema = z.object({
  type: z.string(),
  id: z.string(),
  attributes: z.record(z.unknown()).optional(),
}).passthrough();

const openAIResponseSchema = z
  .object({
    tags: z.array(z.string()),
    entities: z.array(entitySchema).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .passthrough();

const strictOpenAIResponseSchema = openAIResponseSchema.extend({
  entities: z.array(entitySchema),
});

describe("Tagging Schemas", () => {
  it("should validate a valid response with entities", () => {
    const response = {
      tags: ["tag1", "tag2"],
      entities: [
        {
          type: "entity",
          id: "1",
          attributes: {
            name: "test",
          },
        },
      ],
    };
    const result = strictOpenAIResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });

  it("should fail validation if entities are missing", () => {
    const response = {
      tags: ["tag1", "tag2"],
    };
    const result = strictOpenAIResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });

  it("should pass lenient validation if entities are missing", () => {
    const response = {
      tags: ["tag1", "tag2"],
    };
    const result = openAIResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });
});
