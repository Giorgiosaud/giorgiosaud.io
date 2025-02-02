import { column, defineTable } from "astro:db";

export const Keys = defineTable({
  columns: {
    p256dh: column.text(),
    auth: column.text(),
  }
})
