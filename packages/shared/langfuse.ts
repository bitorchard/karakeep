import { Langfuse } from "langfuse";
import logger from "./logger";

export interface LangfuseConfig {
  enabled: boolean;
  publicKey: string | null;
  secretKey: string | null;
  host: string | null;
  promptName: string | null;
}

export interface LangfuseTraceOptions {
  userId: string;
  bookmarkId: string;
  bookmarkType: string;
  promptVersion?: string;
}

export interface LangfuseGenerationOptions {
  name: string;
  input: unknown;
  output?: unknown;
  model: string;
  usage?: {
    input: number;
    output: number;
    total: number;
  };
  metadata?: Record<string, unknown>;
}

export class LangfuseClient {
  private client: Langfuse | null = null;
  private config: LangfuseConfig;

  constructor(config: LangfuseConfig) {
    this.config = config;
    
    if (config.enabled && config.publicKey && config.secretKey) {
      try {
        this.client = new Langfuse({
          publicKey: config.publicKey,
          secretKey: config.secretKey,
          baseUrl: config.host || "https://cloud.langfuse.com",
        });
        logger.info(`Langfuse client initialized for user with host: ${config.host || "https://cloud.langfuse.com"}`);
      } catch (error) {
        logger.error(`Failed to initialize Langfuse client: ${error}`);
        this.client = null;
      }
    }
  }

  isEnabled(): boolean {
    return this.client !== null;
  }

  createTrace(options: LangfuseTraceOptions) {
    if (!this.client) return null;

    try {
      const trace = this.client.trace({
        name: "bookmark-tagging",
        userId: options.userId,
        metadata: {
          bookmarkId: options.bookmarkId,
          bookmarkType: options.bookmarkType,
          promptVersion: options.promptVersion,
        },
      });
      return trace;
    } catch (error) {
      logger.error(`Failed to create Langfuse trace: ${error}`);
      return null;
    }
  }

  async recordGeneration(
    trace: ReturnType<Langfuse["trace"]> | null,
    options: LangfuseGenerationOptions,
  ) {
    if (!trace || !this.client) return;

    try {
      trace.generation({
        name: options.name,
        input: options.input,
        output: options.output,
        model: options.model,
        usage: options.usage,
        metadata: options.metadata,
      });
    } catch (error) {
      logger.error(`Failed to record Langfuse generation: ${error}`);
    }
  }

  async fetchPrompt(promptName: string, variables?: Record<string, string>) {
    if (!this.client) return null;

    try {
      const prompt = await this.client.getPrompt(promptName);
      
      if (!prompt) {
        logger.warn(`Prompt "${promptName}" not found in Langfuse`);
        return null;
      }

      // Compile the prompt with variables if provided
      let compiledPrompt = prompt.prompt;
      if (variables && typeof compiledPrompt === "string") {
        Object.entries(variables).forEach(([key, value]) => {
          compiledPrompt = (compiledPrompt as string).replace(
            new RegExp(`{{${key}}}`, "g"),
            value,
          );
        });
      }

      return {
        prompt: compiledPrompt,
        version: prompt.version,
        config: prompt.config,
      };
    } catch (error) {
      logger.error(`Failed to fetch prompt from Langfuse: ${error}`);
      return null;
    }
  }

  async shutdown() {
    if (this.client) {
      try {
        await this.client.shutdown();
      } catch (error) {
        logger.error(`Failed to shutdown Langfuse client: ${error}`);
      }
    }
  }

  async flushAsync() {
    if (this.client) {
      try {
        await this.client.flushAsync();
      } catch (error) {
        logger.error(`Failed to flush Langfuse client: ${error}`);
      }
    }
  }
}

export function createLangfuseClient(config: LangfuseConfig): LangfuseClient {
  return new LangfuseClient(config);
}

