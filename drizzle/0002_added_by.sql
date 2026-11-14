PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_rings` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text DEFAULT 'ring' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`reason` text,
	`source_url` text,
	`added_by` text DEFAULT 'admin' NOT NULL,
	`created_at` integer NOT NULL,
	`decided_at` integer,
	CONSTRAINT "rings_category_check" CHECK("__new_rings"."category" in ('ring', 'dress', 'shoes')),
	CONSTRAINT "rings_status_check" CHECK("__new_rings"."status" in ('pending', 'like', 'dislike', 'maybe')),
	CONSTRAINT "rings_added_by_check" CHECK("__new_rings"."added_by" in ('admin', 'guest')),
	CONSTRAINT "rings_reason_check" CHECK(("__new_rings"."status" = 'maybe') = ("__new_rings"."reason" is not null))
);
--> statement-breakpoint
INSERT INTO `__new_rings`("id", "category", "status", "reason", "source_url", "created_at", "decided_at") SELECT "id", "category", "status", "reason", "source_url", "created_at", "decided_at" FROM `rings`;--> statement-breakpoint
DROP TABLE `rings`;--> statement-breakpoint
ALTER TABLE `__new_rings` RENAME TO `rings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `rings_category_status_idx` ON `rings` (`category`,`status`,`created_at`);