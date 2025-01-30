// import { app } from "@firebase/server";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { getAuth } from "firebase-admin/auth";

export default defineAction({
  accept:"form",
  input:z.object({
    name:z.string().min(2),
    email:z.string().email(),
    password:z.string().min(8),
    confirmPassword:z.string().min(8),
  }).refine((data)=>{
    if(data.password!==data.confirmPassword){
      return "Passwords do not match"
    }
    return true;
  }),
  handler:async ({name,email,password})=>{
    console.log({name,email,password})
    // const auth = getAuth(app);

    // await auth.createUser({email,password,displayName:name});
    return 'ok';
  },
})