import type { MiddlewareNext } from "astro";
import { getCollection, type ContentCollectionKey } from "astro:content";
import { sequence } from "astro:middleware";
const selfHealingMiddleware=(path:string,collection:ContentCollectionKey)=>async (_,next:MiddlewareNext)=>{
    const {url}=_;
    const splittedUrl = url.pathname.split("/");
    if(url.pathname.includes(`/${path}/`) && splittedUrl.length>2){
        const requestedSlug=splittedUrl.pop();
        const hashToHeal = requestedSlug.match(/\d{6}/)?.[0]; 
        const entrySlug = ((await getCollection(collection, ({id }) => {
            return id;
        })).map((entry)=>entry.id).find((slug)=>slug.includes(hashToHeal)))
        if(entrySlug && entrySlug!==requestedSlug){
            const redirectUrl = `${url.origin}/${path}/${entrySlug}`;
            return Response.redirect(redirectUrl,301);
        }
    }
    const response = await next();
    return response;
}

export const onRequest = sequence(selfHealingMiddleware('notebook','notes'),selfHealingMiddleware('es/cuaderno','notas'))