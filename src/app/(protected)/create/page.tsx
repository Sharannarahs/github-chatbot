'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import useRefetch from '@/hooks/use-refetch'
import { api } from '@/trpc/react' // since FE
import { Info } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type FormInput = {
    repoUrl: string
    projectName: string
    githubToken?: string
}

const CreatePage= () => {

    const {register, handleSubmit, reset} = useForm<FormInput>() 
    const createProject = api.project.createProject.useMutation() // API FRON REACT SINCE FE AND PROJECT FROM ROOT.TS WHICH WE ADDED // MUTATION FUNCTION TO CALL BACKEND FUNCTIONS
    const checkCredits = api.project.checkCredits.useMutation()

    const refetch = useRefetch()

    function onSubmit(data: FormInput){
        if(!!checkCredits.data){
            createProject.mutate({
                githubUrl: data.repoUrl,
                name: data.projectName,
                githubToken: data.githubToken
            }, {
                onSuccess: () => {
                    toast.success('Project created successfully')
                    refetch()
                    reset()
                },
                onError: () => {
                    toast.error('Failed to create project')
                }
            })
        } else {
            checkCredits.mutate({
                githubUrl: data.repoUrl,
                githubToken: data.githubToken
            })
        }
        
        //window.alert(JSON.stringify(data, null, 2))
    
    }
   


    const hasEnoughCredits = checkCredits?.data?.userCredits ? checkCredits.data.fileCount <= checkCredits.data.userCredits : true

  return (
    <div className='flex items-center gap-12 h-full justify-center'>
        <img src="logo.png" className='h-56 w-auto'  />
        <div>
            <div>
                <h1 className='font-semibold text-2xl'>
                    Link your Github Repository
                </h1>
                <p className='text-sm text-muted-foreground'>
                    Enter the URL of yout repository to link
                </p>
            </div>
            <div className='h-4'>
                <div>
                    <form onSubmit={handleSubmit(onSubmit)}>  
                        <Input 
                            {...register('projectName', { required: true })}
                            placeholder='Project Name'
                            required
                        />
                        <div className='h-2'></div>
                        <Input 
                            {...register('repoUrl', { required: true })}
                            placeholder='Github URL'
                            type='url'
                            required
                        />
                        <div className='h-2'></div>
                        <Input 
                            {...register('githubToken')}
                            placeholder='Github Token (Optional)'
                        />
                        {!!checkCredits.data && (
                            <>
                                <div className='mt-4 bg-orange-50 px-4 py-2 rounded-md border border-orange-200 text-orange-700'>
                                    <div className='flec items-center gap-2'>
                                        <Info className='size-4' />
                                        <p className='text-sm'>You will be charged<strong>{checkCredits.data?.fileCount}</strong>Credits for this repository.</p>
                                        
                                    </div>
                                    <p className='text-sm text-blue-600 ml-6'>You have<strong>{checkCredits.data?.userCredits}</strong>credits remaining.</p>
                                </div>
                            </>
                        )}

                        <div className='h-4'></div>
                        <Button type='submit' className='cursor-pointer' disabled={createProject.isPending || !!checkCredits.isPending ||!hasEnoughCredits}>
                            {!!checkCredits.data ? 'Create Project' : 'Check Credits'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    </div>
  )
}

export default CreatePage