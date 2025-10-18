ALTER TABLE `bookmarks` ADD `aiExtractions` text;--> statement-breakpoint
ALTER TABLE `user` ADD `langfuseEnabled` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `user` ADD `langfusePublicKey` text;--> statement-breakpoint
ALTER TABLE `user` ADD `langfuseSecretKey` text;--> statement-breakpoint
ALTER TABLE `user` ADD `langfuseHost` text;--> statement-breakpoint
ALTER TABLE `user` ADD `langfusePromptName` text;