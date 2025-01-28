import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { app } from "@firebase/server";
import { getAuth } from "firebase-admin/auth";

export default defineAction({
  input:z.object({
    email:z.string().email(),
    password:z.string().min(8),
  }),
  handler:async ({email,password},context)=>{
    const auth = getAuth(app);

    const idToken = context.request.headers.get("Authorization")?.split("Bearer ")[1];
    if(!idToken){
      return new Response(
        "No token found",
        { status: 401 }
      );
    }
    try{
      await auth.verifyIdToken(idToken);
    }catch(e){
      return new Response(
        "Invalid token",
        { status: 401 }
      );
    }
    const fivedays = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await auth.createSessionCookie(idToken,{
      expiresIn:fivedays,
    });
    context.cookies.set("__session",sessionCookie,{
      path:"/",
      httpOnly:true,
      sameSite:"strict",
      secure:true,
    });
    return {
      redirected:true,
      url:"/",
    }
  },
})