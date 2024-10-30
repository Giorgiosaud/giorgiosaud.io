import type { MiddlewareNext } from "astro";
import { getCollection, type ContentCollectionKey } from "astro:content";
import { defineMiddleware, sequence } from "astro:middleware";
const selfHealingMiddleware=(path:string,collection:ContentCollectionKey)=>async (_,next:MiddlewareNext)=>{
    const {url}=_;
    if(url.pathname.includes(`/${path}/`)){
        const requestedSlug=url.pathname.split("/").pop();
        const entriesSlugs = (await getCollection(collection, ({slug }) => {
            return slug;
        })).map((entry)=>entry.slug);
        const hashToHeal = requestedSlug.match(/\d{6}/)?.[0]; 
        if(!entriesSlugs.includes(requestedSlug) && hashToHeal){
            
            const slugToHeal=entriesSlugs.find((slug)=>{
                return slug.includes(hashToHeal);
            })
            const redirectUrl = `${url.origin}/${path}/${slugToHeal}`;
            return Response.redirect(redirectUrl,301);
        }
    }
    const response = await next();
    return response;
}

export const onRequest = sequence(selfHealingMiddleware('notebook','notes'),selfHealingMiddleware('es/cuaderno','notas'))