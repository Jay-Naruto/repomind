import { createTRPCRouter, publicProcedure } from "../trpc";

export const projectRouter = createTRPCRouter({
    createProject : publicProcedure.input().mutation(async ({ctx,input}) => {
            return true
    })
})