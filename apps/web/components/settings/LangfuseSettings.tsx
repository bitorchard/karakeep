"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/i18n/client";
import { api } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { zUpdateLangfuseSettingsSchema } from "@karakeep/shared/types/users";

export function LangfuseSettings() {
  const { t } = useTranslation();
  const apiUtils = api.useUtils();
  const [showSecretKey, setShowSecretKey] = useState(false);

  const { data: langfuseSettings, isLoading } =
    api.users.langfuseSettings.useQuery();

  const { mutateAsync: updateSettings, isPending } =
    api.users.updateLangfuseSettings.useMutation({
      onSuccess: () => {
        toast({
          description: "Langfuse settings updated successfully!",
        });
        apiUtils.users.langfuseSettings.invalidate();
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          description: `Failed to update Langfuse settings: ${error.message}`,
        });
      },
    });

  const form = useForm<z.infer<typeof zUpdateLangfuseSettingsSchema>>({
    resolver: zodResolver(zUpdateLangfuseSettingsSchema),
    values: langfuseSettings || {
      langfuseEnabled: false,
      langfusePublicKey: null,
      langfuseSecretKey: null,
      langfuseHost: null,
      langfusePromptName: null,
    },
  });

  const isEnabled = form.watch("langfuseEnabled");

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rounded-md border bg-background p-4">
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-medium">Langfuse Integration</h2>
          <a
            href="https://langfuse.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Learn about Langfuse
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <p className="text-sm text-muted-foreground">
          Connect to Langfuse for advanced prompt management, tracing, and
          evaluation of AI extractions. Once enabled with valid credentials,
          traces will be automatically sent to your Langfuse project.
        </p>
      </div>

      <Form {...form}>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(async (value) => {
            await updateSettings(value);
          })}
        >
          <FormField
            control={form.control}
            name="langfuseEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enable Langfuse</FormLabel>
                  <FormDescription>
                    Automatically send traces and load prompts from Langfuse
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {isEnabled && (
            <>
              <FormField
                control={form.control}
                name="langfusePublicKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Public Key</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="pk-lf-..."
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Your Langfuse public key (starts with pk-lf-)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="langfuseSecretKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secret Key</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type={showSecretKey ? "text" : "password"}
                          placeholder="sk-lf-..."
                          {...field}
                          value={field.value || ""}
                        />
                        <ActionButton
                          type="button"
                          variant="outline"
                          onClick={() => setShowSecretKey(!showSecretKey)}
                        >
                          {showSecretKey ? "Hide" : "Show"}
                        </ActionButton>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Your Langfuse secret key (starts with sk-lf-)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="langfuseHost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Host (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://cloud.langfuse.com"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty to use cloud.langfuse.com. Use custom URL for
                      self-hosted instances.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="langfusePromptName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt Name (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="bookmark-extraction"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Name of the prompt in Langfuse to use for extraction.
                      Leave empty to use local custom prompts or defaults. The
                      prompt should include {"<TEXT_CONTENT>"} placeholder.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <ActionButton
            type="submit"
            variant="default"
            loading={isPending}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Langfuse Settings
          </ActionButton>
        </form>
      </Form>

      {isEnabled && (
        <div className="mt-4 rounded-md bg-muted p-4">
          <h3 className="mb-2 text-sm font-medium">
            What happens when enabled?
          </h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Traces are sent to Langfuse for every AI extraction</li>
            <li>• If prompt name is set, it will be loaded from Langfuse</li>
            <li>
              • Extractions include metadata like tags, entities, and
              relationships
            </li>
            <li>
              • You can view traces, evaluate outputs, and iterate on prompts in
              Langfuse
            </li>
            <li>• All data is sent securely using your API keys</li>
          </ul>
        </div>
      )}
    </div>
  );
}
