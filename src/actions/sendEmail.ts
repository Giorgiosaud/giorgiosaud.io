import { defineAction } from "astro:actions";
import { z } from 'astro:schema';

export const prerender = false
export default defineAction({
  accept:'form',
  input: z.object({
    name: z.string({message:"Name is required"}).min(2,{message:"Name is too short"}),
    email: z.string().email({message:"Invalid email"}),
    message: z.string({message:"Message is required"}).min(10,{message:"Message is too short"}),
  }),
  handler: async ({name,email,message},ctx) => {
    console.log({name,email,message,ctx})
    const access_key=import.meta.env.WEB_FORMS3_API_KEY;
    const body=JSON.stringify({name,email,message,access_key} )
    try{
      const response=await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body,
      })
      const json = await response.json();
      return {message:"Thank you for your message!"+JSON.stringify(json)};
    }catch(error){
      return {error,message:"Something went wrong!"};
    }
  },
});