CREATE TABLE `app_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`admin_password_hash` text NOT NULL,
	`admin_password_is_default` integer DEFAULT true NOT NULL,
	`guest_code_hash` text,
	`guest_hint` text,
	`updated_at` integer NOT NULL,
	CONSTRAINT "app_settings_singleton" CHECK("app_settings"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE `rings` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`reason` text,
	`source_url` text,
	`created_at` integer NOT NULL,
	`decided_at` integer,
	CONSTRAINT "rings_status_check" CHECK("rings"."status" in ('pending', 'like', 'dislike', 'maybe')),
	CONSTRAINT "rings_reason_check" CHECK(("rings"."status" = 'maybe') = ("rings"."reason" is not null))
);
--> statement-breakpoint
CREATE INDEX `rings_status_idx` ON `rings` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT "sessions_role_check" CHECK("sessions"."role" in ('admin', 'guest'))
);
--> statement-breakpoint
CREATE INDEX `sessions_role_idx` ON `sessions` (`role`);