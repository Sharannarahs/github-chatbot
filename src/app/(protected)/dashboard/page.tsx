'use client'
import useProject from '@/hooks/use-projects'
import { ExternalLink, Github } from 'lucide-react'
import Link from 'next/link'
//import { useUser } from '@clerk/nextjs'
import React from 'react'
import CommitLog from './commit-log'
import AskQuestionCard from './ask-question'
import MeetingCard from './meeting-card'
import ArchiveButton from './archive-button'
import InviteButton from './invite-button'
import TeamMembers from './team-members'

const DashboardPage = () => {
 
    //const { user } = useUser() // useUser() is a React hook provided by Clerk to access the currently signed-in user's info on the client side
    // RETURNS const { user, isLoaded, isSignedIn } = useUser()

    const { project } = useProject()

  return (
    <div>
      <div className='flex items-center justify-between flex-wrap gap-y-4'>
        {/* gihub link */}
        <div className='w-fit rounded-md bg-primary px-4 py-3'>
          <div className='flex items-center'> 
            <Github className='size-5 text-white'/>
            <div className='ml-2'>
              <p className='text-sm font-medium text-white'>
                This project is linked to {' '}
                <Link href={project?.githubUrl ?? ""} className='inline-flex items-center hover:underline text-white'>
                  {project?.githubUrl}
                  <ExternalLink className='ml-1 size-4'/>
                </Link>
              </p>
            </div>
          </div>
          
        </div>

        <div className='h-4'></div>

        <div className='flex items-center gap-4'>
          <TeamMembers />
          <InviteButton />
          <ArchiveButton />
        </div>

      </div>

      <div className='mt-4'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-5'>
          <AskQuestionCard />
          <MeetingCard />
        </div>
      </div>

      <div className='mt-8'></div>
      <CommitLog /> 
        
    </div>
    
  )
}

export default DashboardPage