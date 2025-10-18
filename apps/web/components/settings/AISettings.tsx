"use client";

import { ActionButton } from "@/components/ui/action-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { FullPageSpinner } from "@/components/ui/full-page-spinner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useClientConfig } from "@/lib/clientConfig";
import { useTranslation } from "@/lib/i18n/client";
import { api } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  buildImagePrompt,
  buildSummaryPrompt,
  buildTextPrompt,
} from "@karakeep/shared/prompts";
import {
  zNewPromptSchema,
  ZPrompt,
  zUpdatePromptSchema,
} from "@karakeep/shared/types/prompts";

export function PromptEditor() {
  const { t } = useTranslation();
  const apiUtils = api.useUtils();

  const form = useForm<z.infer<typeof zNewPromptSchema>>({
    resolver: zodResolver(zNewPromptSchema),
    defaultValues: {
      text: "",
      appliesTo: "text",
    },
  });

  const { mutateAsync: createPrompt, isPending: isCreating } =
    api.prompts.create.useMutation({
      onSuccess: () => {
        toast({
          description: "Prompt has been created!",
        });
        apiUtils.prompts.list.invalidate();
      },
    });

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-2"
        onSubmit={form.handleSubmit(async (value) => {
          await createPrompt(value);
          form.resetField("text");
        })}
      >
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => {
            return (
              <FormItem className="flex-1">
                <FormControl>
                  <textarea
                    placeholder="Enter your complete prompt here. This will completely override the default prompt."
                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="appliesTo"
            render={({ field }) => {
              return (
                <FormItem className="flex-0">
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Applies To" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all_tagging">
                            {t("settings.ai.all_tagging")}
                          </SelectItem>
                          <SelectItem value="text">
                            {t("settings.ai.text_tagging")}
                          </SelectItem>
                          <SelectItem value="images">
                            {t("settings.ai.image_tagging")}
                          </SelectItem>
                          <SelectItem value="summary">
                            {t("settings.ai.summarization")}
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <ActionButton
            type="submit"
            loading={isCreating}
            variant="default"
            className="items-center"
          >
            <Plus className="mr-2 size-4" />
            {t("actions.add")}
          </ActionButton>
        </div>
      </form>
    </Form>
  );
}

export function PromptRow({ prompt }: { prompt: ZPrompt }) {
  const { t } = useTranslation();
  const apiUtils = api.useUtils();
  const { mutateAsync: updatePrompt, isPending: isUpdating } =
    api.prompts.update.useMutation({
      onSuccess: () => {
        toast({
          description: "Prompt has been updated!",
        });
        apiUtils.prompts.list.invalidate();
      },
    });
  const { mutate: deletePrompt, isPending: isDeleting } =
    api.prompts.delete.useMutation({
      onSuccess: () => {
        toast({
          description: "Prompt has been deleted!",
        });
        apiUtils.prompts.list.invalidate();
      },
    });

  const form = useForm<z.infer<typeof zUpdatePromptSchema>>({
    resolver: zodResolver(zUpdatePromptSchema),
    defaultValues: {
      promptId: prompt.id,
      text: prompt.text,
      appliesTo: prompt.appliesTo,
    },
  });

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-2"
        onSubmit={form.handleSubmit(async (value) => {
          await updatePrompt(value);
        })}
      >
        <FormField
          control={form.control}
          name="promptId"
          render={({ field }) => {
            return (
              <FormItem className="hidden">
                <FormControl>
                  <Input type="hidden" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => {
            return (
              <FormItem className="flex-1">
                <FormControl>
                  <textarea
                    placeholder="Enter your complete prompt here. This will completely override the default prompt."
                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="appliesTo"
            render={({ field }) => {
              return (
                <FormItem className="flex-0">
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Applies To" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all_tagging">
                            {t("settings.ai.all_tagging")}
                          </SelectItem>
                          <SelectItem value="text">
                            {t("settings.ai.text_tagging")}
                          </SelectItem>
                          <SelectItem value="images">
                            {t("settings.ai.image_tagging")}
                          </SelectItem>
                          <SelectItem value="summary">
                            {t("settings.ai.summarization")}
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <ActionButton
            loading={isUpdating}
            variant="secondary"
            type="submit"
            className="items-center"
          >
            <Save className="mr-2 size-4" />
            {t("actions.save")}
          </ActionButton>
          <ActionButton
            loading={isDeleting}
            variant="destructive"
            onClick={() => deletePrompt({ promptId: prompt.id })}
            className="items-center"
            type="button"
          >
            <Trash2 className="mr-2 size-4" />
            {t("actions.delete")}
          </ActionButton>
        </div>
      </form>
    </Form>
  );
}

export function TaggingRules() {
  const { t } = useTranslation();
  const { data: prompts, isLoading } = api.prompts.list.useQuery();

  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="w-full text-xl font-medium sm:w-1/3">
        {t("settings.ai.tagging_rules")}
      </div>
      <p className="mb-1 text-xs italic text-muted-foreground">
        Custom prompts completely override the default prompts. Use this to test
        different prompt formats and extraction schemas.
      </p>
      <p className="mb-1 text-xs italic text-muted-foreground">
        <strong>Note:</strong> Your prompt must output a JSON object with at
        least a &quot;tags&quot; field (array of strings). You can also add
        other fields like &quot;people&quot;, &quot;organizations&quot;,
        &quot;locations&quot;, &quot;events&quot;, &quot;projects&quot;,
        &quot;dates&quot;, &quot;deadlines&quot;, &quot;relationships&quot;,
        &quot;intent&quot;, &quot;topics&quot;, etc.
      </p>
      {isLoading && <FullPageSpinner />}
      {prompts && prompts.length == 0 && (
        <p className="rounded-md bg-muted p-2 text-sm text-muted-foreground">
          You don&apos;t have any custom prompts yet.
        </p>
      )}
      {prompts &&
        prompts.map((prompt) => <PromptRow key={prompt.id} prompt={prompt} />)}
      <PromptEditor />
    </div>
  );
}

export function PromptDemo() {
  const { t } = useTranslation();
  const { data: prompts } = api.prompts.list.useQuery();
  const clientConfig = useClientConfig();
  return (
    <div className="flex flex-col gap-2">
      <div className="mb-4 w-full text-xl font-medium sm:w-1/3">
        {t("settings.ai.prompt_preview")}
      </div>
      <p>{t("settings.ai.text_prompt")}</p>
      <code className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm text-muted-foreground">
        {buildTextPrompt(
          clientConfig.inference.inferredTagLang,
          (prompts ?? [])
            .filter(
              (p) => p.appliesTo == "text" || p.appliesTo == "all_tagging",
            )
            .map((p) => p.text),
          "\n<CONTENT_HERE>\n",
          /* context length */ 1024 /* The value here doesn't matter */,
        ).trim()}
      </code>
      <p>{t("settings.ai.images_prompt")}</p>
      <code className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm text-muted-foreground">
        {buildImagePrompt(
          clientConfig.inference.inferredTagLang,
          (prompts ?? [])
            .filter(
              (p) => p.appliesTo == "images" || p.appliesTo == "all_tagging",
            )
            .map((p) => p.text),
        ).trim()}
      </code>
      <p>{t("settings.ai.summarization_prompt")}</p>
      <code className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm text-muted-foreground">
        {buildSummaryPrompt(
          clientConfig.inference.inferredTagLang,
          (prompts ?? [])
            .filter((p) => p.appliesTo == "summary")
            .map((p) => p.text),
          "\n<CONTENT_HERE>\n",
          /* context length */ 1024 /* The value here doesn't matter */,
        ).trim()}
      </code>
    </div>
  );
}

export default function AISettings() {
  const { t } = useTranslation();
  return (
    <>
      <div className="rounded-md border bg-background p-4">
        <div className="mb-2 flex flex-col gap-3">
          <div className="w-full text-2xl font-medium sm:w-1/3">
            {t("settings.ai.ai_settings")}
          </div>
          <TaggingRules />
        </div>
      </div>
      <div className="mt-4 rounded-md border bg-background p-4">
        <PromptDemo />
      </div>
    </>
  );
}
