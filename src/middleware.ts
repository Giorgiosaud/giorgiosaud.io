import type { MiddlewareNext } from "astro";
import { getCollection, type CollectionKey } from "astro:content";
import { sequence } from "astro:middleware";
const selfHealingMiddleware=(path:string,collection:CollectionKey)=>async (_,next:MiddlewareNext)=>{
    const {url}=_;
    const splittedUrl = url.pathname.split("/");
    const requestedSlug=splittedUrl.pop();
    const hashToHeal = requestedSlug.match(/\d{6}/)?.[0]; 
    console.log({hashToHeal,requestedSlug,splittedUrl});
    if(url.pathname.includes(`/${path}/`) && hashToHeal){
        const entrySlug = ((await getCollection(collection, ({id }) => {
            return id;
        })).map((entry)=>entry.id).find((slug)=>slug.includes(hashToHeal)))
        if(!entrySlug){
            
            return _.rewrite('/404',{statusCode:404})
        }
        if(entrySlug && entrySlug!==requestedSlug){
            const redirectUrl = `${url.origin}/${path}/${entrySlug}`;
            return Response.redirect(redirectUrl,301);
        }
    }
    const response = await next();
    return response;
}

export const onRequest = sequence(selfHealingMiddleware('notebook','notes'),selfHealingMiddleware('es/cuaderno','notas'),selfHealingMiddleware('team','team'),selfHealingMiddleware('es/equipo','equipo')) 