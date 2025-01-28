import type { APIContext, MiddlewareHandler, MiddlewareNext } from "astro";
import { getCollection, type CollectionKey } from "astro:content";

const selfHealingMiddleware=(path:string,collection:CollectionKey):MiddlewareHandler=>async (context: APIContext,next:MiddlewareNext)=>{
  const {url}=context;
  const splittedUrl = url.pathname.split("/");
  const requestedSlug=splittedUrl.pop() as string;
  const hashToHeal = requestedSlug.match(/\d{6}/)?.[0]; 
  if(url.pathname.includes(`/${path}/`) && hashToHeal){
      const entrySlug = ((await getCollection(collection, ({id }) => {
          return id;
      })).map((entry)=>entry.id).find((slug)=>slug.includes(hashToHeal)))
      if(!entrySlug){
          return context.rewrite('/404');
      }
      if(entrySlug && entrySlug!==requestedSlug){
          const redirectUrl = `${url.origin}/${path}/${entrySlug}`;
          return Response.redirect(redirectUrl,301);
      }
  }
  const response = await next();
  return response;
}
export default selfHealingMiddleware;