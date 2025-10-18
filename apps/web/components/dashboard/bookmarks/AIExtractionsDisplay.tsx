import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { ZAiExtractions } from "@karakeep/shared/types/bookmarks";

interface AIExtractionsDisplayProps {
  aiExtractions: ZAiExtractions;
}

interface Entity {
  type: string;
  id: string;
  attributes?: Record<string, unknown>; // Optional in loose mode
  [key: string]: unknown; // Allow any additional fields
}

function formatFieldName(fieldName: string): string {
  // Convert camelCase or snake_case to Title Case
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function renderPropertyValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    return <span className="text-sm">{value}</span>;
  }

  if (typeof value === "number") {
    return <span className="text-sm">{value}</span>;
  }

  if (typeof value === "boolean") {
    return (
      <Badge variant={value ? "default" : "secondary"} className="text-xs">
        {value ? "Yes" : "No"}
      </Badge>
    );
  }

  if (Array.isArray(value)) {
    // If it's an array of strings (like tags), show as badges
    if (value.every((item) => typeof item === "string")) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {item}
            </Badge>
          ))}
        </div>
      );
    }
    // For arrays of objects or mixed types, show as formatted JSON
    return (
      <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  if (typeof value === "object") {
    // Check if it's a relation object
    const obj = value as Record<string, unknown>;
    if (obj.relation_type && obj.value) {
      return (
        <span className="text-sm">
          <Badge variant="outline" className="mr-1 text-xs">
            {String(obj.relation_type)}
          </Badge>
          {String(obj.value)}
        </span>
      );
    }
    // For other nested objects, show as formatted JSON
    return (
      <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return <span className="text-sm">{String(value)}</span>;
}

function renderEntity(entity: Entity, index: number): React.ReactNode {
  const hasAttributes = entity.attributes && Object.keys(entity.attributes).length > 0;
  
  return (
    <Card key={entity.id || index} className="bg-muted/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs">
            {entity.type}
          </Badge>
          {entity.id && (
            <span className="text-xs text-muted-foreground">{entity.id}</span>
          )}
        </div>
      </CardHeader>
      {hasAttributes && (
        <CardContent className="pt-0">
          <div className="flex flex-col gap-2">
            {Object.entries(entity.attributes!).map(([key, value]) => (
              <div key={key} className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {formatFieldName(key)}
                </span>
                {renderPropertyValue(value)}
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function renderValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    return <span className="text-sm">{value}</span>;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return <span className="text-sm">{String(value)}</span>;
  }

  if (Array.isArray(value)) {
    // If it's an array of strings (like tags), show as badges
    if (value.every((item) => typeof item === "string")) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {item}
            </Badge>
          ))}
        </div>
      );
    }
    // For arrays of objects or mixed types, show as comma-separated
    return <span className="text-sm">{value.map(String).join(", ")}</span>;
  }

  if (typeof value === "object") {
    // For nested objects, show as formatted JSON
    return (
      <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return <span className="text-sm">{String(value)}</span>;
}

export function AIExtractionsDisplay({
  aiExtractions,
}: AIExtractionsDisplayProps) {
  if (!aiExtractions || typeof aiExtractions !== "object") {
    return null;
  }

  const data = aiExtractions as Record<string, unknown>;

  // Check if this is the new entity-based format
  const hasEntities = Array.isArray(data.entities);
  const entities = hasEntities ? (data.entities as Entity[]) : [];
  const metadata = data.metadata as Record<string, unknown> | undefined;

  // Get other fields (excluding tags, entities, metadata for entity-based format)
  const otherEntries = Object.entries(data).filter(
    ([key, value]) =>
      key !== "tags" && // Skip tags - they're shown separately
      (!hasEntities || (key !== "entities" && key !== "metadata")) &&
      value !== null &&
      value !== undefined &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0),
  );

  const hasContent = entities.length > 0 || otherEntries.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">AI Extractions</CardTitle>
        {metadata && metadata.extraction_date && (
          <p className="text-xs text-muted-foreground">
            Extracted: {String(metadata.extraction_date)}
            {metadata.entities_extracted &&
              ` • ${metadata.entities_extracted} entities`}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Render entities if present (new format) */}
          {entities.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">Entities</h3>
              {entities.map((entity, index) => renderEntity(entity, index))}
            </div>
          )}

          {/* Render other fields (legacy format or additional data) */}
          {otherEntries.length > 0 && (
            <div className="flex flex-col gap-3">
              {entities.length > 0 && (
                <h3 className="text-sm font-semibold">Additional Data</h3>
              )}
              {otherEntries.map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    {formatFieldName(key)}
                  </span>
                  {renderValue(value)}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
