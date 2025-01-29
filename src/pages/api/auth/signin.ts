export const prerender = false;
import type { APIRoute } from "astro";
import { app } from "@firebase/server";
import { getAuth } from "firebase-admin/auth";

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const auth = getAuth(app);
  request.headers.forEach((value, key) => {
    console.log(`${key} ==> ${value}`);
  });
  /* Get token from request headers */
  const authorizationHeader = request.headers.get("Authorization");
  const idToken = authorizationHeader?.split("Bearer ")[1];
  
  if (!idToken) {
    return new Response(
      "No token found",
      { status: 401 }
    );
  }

  /* Verify id token */
  try {
    const verified=await auth.verifyIdToken(idToken);
    console.log(verified)
  } catch (error) {
    return new Response(
      "Invalid token",
      { status: 401 }
    );
  }

  /* Create and set session cookie */
  const fiveDays = 60 * 60 * 24 * 5 * 1000;
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: fiveDays,
  });

  cookies.set("__session", sessionCookie, {
    path: "/",
  });

  return redirect("/");
};