'use client'

import useProject from '@/hooks/use-projects'
import { api } from '@/trpc/react'
import React from 'react'

const TeamMembers = () => {
    const { projectId } = useProject()
    const { data: members, isLoading, isError } = api.project.getTeamMemebrs.useQuery({ projectId })

    if (isLoading) return <p>Loading team members...</p>
  if (isError || !members) return <p>Error loading team members.</p>
  return (
        <div className='flex items-center gap-2'>
            {members.map(member => (
                <img key={member.id} src={member.user.imageUrl || ''} alt={member.user.firstName || ''} height={30} width={30} className='rounded-full' />
            ))}
        </div>
  )
}

export default TeamMembers