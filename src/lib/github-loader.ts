// THIS FUNCTION TAKES A GITHUB URL AND LISTS THE FILES IN THE REPOSITORY
import {GithubRepoLoader} from '@langchain/community/document_loaders/web/github'
// Loading and parsing content (code, markdown, docs, etc.) from a GitHub repository into documents that can be used in LLM pipelines, like for RAG (Retrieval-Augmented Generation).

import { Document } from '@langchain/core/documents'
import { summariseCode, generateEmbedding } from './gemini'
import { db } from '@/server/db'
import { Octokit } from 'octokit'

// GETS NUMBER OF FILES OF A REPO (recursive function)
const getFileCount = async (path: string, octokit: Octokit, githubOwner: string, githubRepo: string, acc: number = 0) => {
    const {data} = await octokit.rest.repos.getContent({
        owner: githubOwner,
        repo: githubRepo,
        path
    })
    if(!Array.isArray(data) && data.type === 'file') {
        return acc + 1
    }
    if(Array.isArray(data)) {
        let fileCount = 0
        const directories: string[] = []

        for(const item of data){
            if(item.type === 'dir') {
                directories.push(item.path)
            } else {
                fileCount++
            }
        }
        if(directories.length > 0) {
            const directoryCounts = await Promise.all(
                directories.map(dirPath => getFileCount(dirPath, octokit, githubOwner, githubRepo, 0))
            )
            fileCount += directoryCounts.reduce((acc, count) => acc + count, 0)
        }
        return acc + fileCount
    }
    return acc
}

export const checkCredits = async (githubUrl: string, githubToken?: string) => {
    // FIND OUT HOW MANT FILES ARE THERE IN THE REPO
    const octokit = new Octokit({ auth: githubToken })
    const githubOwner = githubUrl.split('/')[3]
    const githubRepo = githubUrl.split('/')[4]
    if(!githubOwner || !githubRepo){
        return 0
    }
    const fileCount = await getFileCount('', octokit, githubOwner, githubRepo, 0)
    return fileCount
    
}

export const loadGithubRepo = async(githubUrl: string, githubToken?: string) => {
    const loader = new GithubRepoLoader(githubUrl, {
        accessToken: githubToken || '',
        branch: 'main',
        ignoreFiles: ['package-lock-json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'],
        recursive: true, // If you want to load all files in the repository, set this to true
        unknown: 'warn',
        maxConcurrency: 5 // Adjust this based on your needs and the rate limits of the GitHub API
    })  
    const docs = await loader.load()
    return docs
}

/* RETURN TYPE =>
Document {
'white',\n    'text_bg': 'white',\n    'text_fg': 'black',\n    'plot_bg': 'white',\n    'plot_fg': 'black',\n    'waveform_color': '#4caf50',\n    'axis_color': 'black',\n    'grid_color': '#dddddd'\n}\ndef get_styles():\n    return {'dark_theme': dark_theme, 'light_theme': light_theme, 'button_style': button_style}",
    metadata: {
      source: "app/utils/config.py",
      repository: "https://github.com/CowTheGreat/Real-Time-Audio-Recorder-and-Transcriber-using-Whisper-AI",     
      branch: "main",
    },
    id: undefined,

 */   

// console.log(await loadGithubRepo('https://github.com/CowTheGreat/Real-Time-Audio-Recorder-and-Transcriber-using-Whisper-AI'))


// FUNCTION TO STROE IN DB
export const indexGithubRepo = async(projectId: string, githubUrl: string, githubToken?: string) => {
    const docs = await loadGithubRepo(githubUrl, githubToken)
    const allEmbeddings = await generateEmbeddings(docs)
    await Promise.allSettled(allEmbeddings.map(async (embedding, index) => {
        console.log(`processing ${index} of ${allEmbeddings.length}`)
        if(!embedding) return

        const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
            data: {
                summary: embedding.summary,
                SourceCode: embedding.sourceCode,
                fileName: embedding.fileName,
                projectId,
            }
        })
        // TO STORE VECTOR PRISMA DOESNT, SO USE SQL
        await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding" = ${embedding.embedding}::Vector
        WHERE "id" = ${sourceCodeEmbedding.id}
        `

    }))
}

// GETS SUMMARY AND GENERATES EMBEDDINGS
const generateEmbeddings = async (docs: Document[]) => {
    return await Promise.all(docs.map(async doc => {
        const summary = await summariseCode(doc)
        const embedding = await generateEmbedding(summary)
        return {
            summary,
            embedding,
            sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
            fileName: doc.metadata.source,
        }
    }))
}