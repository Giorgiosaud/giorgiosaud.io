import { sequence } from "astro:middleware";
import selfHealingMiddleware from "./selfHealingMiddleware";


export const onRequest = sequence(selfHealingMiddleware('notebook','notes'),selfHealingMiddleware('es/cuaderno','notas'),selfHealingMiddleware('team','team'),selfHealingMiddleware('es/equipo','equipo')) 
