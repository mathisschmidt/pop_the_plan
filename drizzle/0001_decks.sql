PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_rings` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text DEFAULT 'ring' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`reason` text,
	`source_url` text,
	`created_at` integer NOT NULL,
	`decided_at` integer,
	CONSTRAINT "rings_category_check" CHECK("__new_rings"."category" in ('ring', 'dress', 'shoes')),
	CONSTRAINT "rings_status_check" CHECK("__new_rings"."status" in ('pending', 'like', 'dislike', 'maybe')),
	CONSTRAINT "rings_reason_check" CHECK(("__new_rings"."status" = 'maybe') = ("__new_rings"."reason" is not null))
);
--> statement-breakpoint
INSERT INTO `__new_rings`("id", "status", "reason", "source_url", "created_at", "decided_at") SELECT "id", "status", "reason", "source_url", "created_at", "decided_at" FROM `rings`;--> statement-breakpoint
DROP TABLE `rings`;--> statement-breakpoint
ALTER TABLE `__new_rings` RENAME TO `rings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `rings_category_status_idx` ON `rings` (`category`,`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `__new_app_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`admin_password_hash` text NOT NULL,
	`admin_password_is_default` integer DEFAULT true NOT NULL,
	`guest_code_hash` text,
	`guest_hint` text,
	`open_categories` text DEFAULT '["ring"]' NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "app_settings_singleton" CHECK("__new_app_settings"."id" = 1),
	CONSTRAINT "app_settings_open_categories_check" CHECK(json_valid("__new_app_settings"."open_categories") and json_type("__new_app_settings"."open_categories") = 'array')
);
--> statement-breakpoint
INSERT INTO `__new_app_settings`("id", "admin_password_hash", "admin_password_is_default", "guest_code_hash", "guest_hint", "updated_at") SELECT "id", "admin_password_hash", "admin_password_is_default", "guest_code_hash", "guest_hint", "updated_at" FROM `app_settings`;--> statement-breakpoint
DROP TABLE `app_settings`;--> statement-breakpoint
ALTER TABLE `__new_app_settings` RENAME TO `app_settings`;