import { app } from "@firebase/server";
import type { MiddlewareHandler } from "astro";
import { getAuth } from "firebase-admin/auth";

export const authMiddleware:MiddlewareHandler=async (context,next)=>{
  if(context.cookies.has("__session")){
    const cookie = context.cookies.get("__session");
    if(cookie){
      context.locals.user=await getAuth(app).getUser(
        cookie.value
      );
    }
  }
  return next();
  
}