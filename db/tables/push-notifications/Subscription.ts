import { column, defineTable } from "astro:db";
import { Keys } from "./Keys";

export const Subscription = defineTable({
  columns: {
    endpoint: column.text(),
    expirationTime: column.date(),
    keys: column.text({references:()=>Keys.columns.p256dh}),
  }
})

