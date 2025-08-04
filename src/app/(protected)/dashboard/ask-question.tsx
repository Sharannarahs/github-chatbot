'use client'

import React from 'react'
import useProject from '@/hooks/use-projects'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Image from 'next/image'
import { askQuestion } from './actions' 
import { readStreamableValue } from 'ai/rsc'
import MDEditor from '@uiw/react-md-editor'
import CodeReferences from './code-references'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import useRefetch from '@/hooks/use-refetch'

const AskQuestionCard = () => {
    const { project } = useProject()
    const [question, setQuestion] = React.useState('')
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [filesReferences, setFilesReferences] = React.useState<{ fileName:string; sourceCode: string; summary: string }[]>([])
    const [answer, setAnswer] = React.useState('')
    const saveAnswer = api.project.saveAnswer.useMutation()

    const onSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        setAnswer('')
        setFilesReferences([])
        e.preventDefault()
        if(!project?.id) return
        setLoading(true)
        

        const { output, filesReferences } = await askQuestion(question, project.id)
        setOpen(true)
        setFilesReferences(filesReferences)

        for await (const delta of readStreamableValue(output)) {
            if (delta) {
                setAnswer(ans => ans + delta)
            }

        }
        setLoading(false)
    }

    const refetch = useRefetch()


  return (
    <>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className='sm:max-w-[80vw]'>
                <DialogHeader>
                    <div className='flex items-center gap-2'></div>
                    <DialogTitle>
                        <div className="flex items-center gap-2">
                            <Image src='/logo.png' alt='logo' width={40} height={40} />
                        </div>
                    </DialogTitle>
                    <Button disabled={saveAnswer.isPending} variant={'outline'} onClick={() => {
                        saveAnswer.mutate({
                            projectId: project!.id,
                            question,
                            answer, 
                            filesReferences
                        }, {
                            onSuccess: () => {
                                toast.success('Answer saved!')
                                refetch()
                            },
                            onError: () => {
                                toast.error('Failed to save answer')
                            }
                        })
                    }}>
                        Save Answer
                    </Button>

                </DialogHeader>
                
                <MDEditor.Markdown source={answer}className='max-w-[70vw] lh-full max-h-[40vh] overflow-scroll' />
                <div className='h-4'></div>
                <CodeReferences filesReferences={filesReferences} />

                <Button className='cursor-pointer' type='button' onClick={() => {setOpen(false); setAnswer('')}}>
                    Close
                </Button>
            </DialogContent>
        </Dialog>
        <Card className='relative col-span-3'>
            <CardHeader>
                <CardTitle>
                    Ask a Question
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} >
                    <Textarea placeholder='which file should I edit to change the home page?' value={question} onChange={e => setQuestion(e.target.value)} />
                    <div className='h-4'></div>
                    <Button type='submit' className='cursor-pointer' disabled={loading}>
                        Ask ChatBot!
                    </Button>
                </form>
            </CardContent>
            
        </Card>
    </>
    
  )
}

export default AskQuestionCard