import {file, z} from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";
import { checkCredits, indexGithubRepo } from "@/lib/github-loader";

export const  projectRouter = createTRPCRouter({
  createProject: protectedProcedure.input(
    z.object({
        name: z.string(),
        githubUrl: z.string(),
        githubToken: z.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {

    const user = await ctx.db.user.findUnique({ where: {id: ctx.user.userId! }, select: { credits: true}})
    if(!user) {
      throw new Error("USer not found")
    }
    const currentCredits = user.credits || 0
    const fileCount = await checkCredits(input.githubUrl, input.githubToken)

    if(currentCredits < fileCount) {
      throw new Error('Insufficient credits')
    }

    // project is prisma model
    const project = await ctx.db.project.create({ 
        data: {
            githubUrl: input.githubUrl,
            name: input.name,
            userToProjects: {
                create: {
                    userId: ctx.user.userId!, // ! since I am sure ctx.user.userId is not null or undefined here.
                }
            }
        }
        
    })
    await indexGithubRepo(project.id, input.githubUrl, input.githubToken) // from github-loader.ts
    await pollCommits(project.id) // Poll commits for the project
    await ctx.db.user.update({ where: { id:ctx.user.userId! }, data: { credits: { decrement: fileCount }}})
    return project
    
    //console.log('input', input)
    //return true
  }),

  // PROTECTEDPROCEDURE SINCE I ONLY LOGIN ANDONLY I WNAT TO KNOW THE PROJECTS
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.project.findMany({
        where: {
            userToProjects: {
                some: { // some means Only include projects where at least one UserToProject entry exists with this userId
                    userId: ctx.user.userId!,
                }
            },
            deletedAt: null // If deletedAt has a timestamp (new Date()), it means the item was "soft deleted". // This lets you "hide" items without removing them from the database.
        }
    })
  }),
  getCommits: protectedProcedure.input(z.object({
    projectId: z.string()
  })).query(async ({ ctx, input }) => {
    pollCommits(input.projectId).then().catch(console.error)
    return await ctx.db.commit.findMany({ where: { projectId: input.projectId} })
    }),
    saveAnswer: protectedProcedure.input(z.object({
      projectId: z.string(),
      question: z.string(),
      answer: z.string(),
      filesReferences: z.any()
    })).mutation(async ({ctx, input}) => {
      return await ctx.db.question.create({
        data: {
          answer: input.answer,
          filesReferences: input.filesReferences,
          projectId: input.projectId,
          question: input.question,
          userId: ctx.user.userId!
        }
      })
    }) ,
    getQuestions: protectedProcedure.input(z.object({projectId:z.string()}))
    .query(async ({ctx,input}) => {
      return await ctx.db.question.findMany({
        where: {
          projectId: input.projectId
        },
        include: {
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }),
    archiveProject: protectedProcedure.input(z.object({ projectId: z.string() })).mutation(async ({ ctx, input }) => {
      return await ctx.db.project.update({ where: { id: input.projectId }, data: { deletedAt: new Date() }})
    }),
    getTeamMemebrs: protectedProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input}) => {
      return await ctx.db.userToProject.findMany({where: { projectId: input.projectId }, include: {user: true }})
    }),
    getMyCredits: protectedProcedure.query(async ({ ctx }) => {
      return await ctx.db.user.findUnique({ where: { id: ctx.user.userId! }, select: { credits: true}})
    }),
    checkCredits: protectedProcedure.input(z.object({ githubUrl: z.string(), githubToken: z.string().optional() })).mutation(async({ ctx, input }) => {
      const fileCount = await checkCredits(input.githubUrl, input.githubToken)
      const userCredits = await ctx.db.user.findUnique({ where: { id: ctx.user.userId!}, select:{ credits: true }})
      return { fileCount, userCredits: userCredits?.credits || 0 } 
    })
})
