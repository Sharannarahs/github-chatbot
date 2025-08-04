import { api } from '@/trpc/react'
import { useLocalStorage } from 'usehooks-ts'

const useProject = () => { // CUSTOM HOOK
    const {data: projects} = api.project.getProjects.useQuery()
    const [projectId, setProjectId] = useLocalStorage('githubchatbot-projectId')
    const project = projects?.find(project => project.id === projectId)
    return{
        projects,
        project,
        projectId,
        setProjectId
    }
}

export default useProject

