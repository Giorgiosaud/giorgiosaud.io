import type { APIRoute } from "astro";
import { db, Subscription } from "astro:db";
export const prerender = false;
export type SubscriptionType={
  endpoint:string,
  expirationTime:Date,
  keys:{
    p256dh:string,
    auth:string
  }
}; 
export const POST:APIRoute = async ({request})=>{
  const body = await request.json() as SubscriptionType;
  console.log('/add-subscription');
  console.log({subscription:{...request.body}});

  console.log(`Subscribing ${body?.endpoint}`);
  await db.insert(Subscription).values({ endpoint: body.endpoint, expirationTime: body.expirationTime, keys: {...body.keys} });
  return new Response(JSON.stringify({status:'ok'}),{status:200});
}