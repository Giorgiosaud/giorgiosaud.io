import { defineDb } from 'astro:db';
import { Subscription } from './tables/push-notifications/Subscription';
import { Keys } from './tables/push-notifications/Keys';

// https://astro.build/db/config
export default defineDb({
  tables: {
    Subscription,
    Keys
  }
});
