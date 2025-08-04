import { db } from '@/server/db'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation';

const SyncUser = async () => {
    const { userId } = await auth(); // auth() – gets the current signed-in user on the server // userId is the unique ID of the currently signed-in user.
    if(!userId) {
        throw new Error('User not found')
    }

    
    // clerkClient – gives you full access to Clerk's server-side API (like user info).
    const client = await clerkClient()
    const user = await client.users.getUser(userId) // Fetches the full Clerk user object from the backend. // Includes metadata, name, email, etc. // You use this to sync with your own database, validate email, etc.

 
    if(!user.emailAddresses[0]?.emailAddress) { // Clerk supports multiple email addresses per user. // user.emailAddresses[0]?.emailAddress accesses the primary email. 
        return notFound()
    }
    // UPSERT - IF USER EXIST UPDATE OR CREATE
    await db.user.upsert({
        where: { // // check if user exists
            emailAddress: user.emailAddresses[0]?.emailAddress ?? ""
        },
        update: { // // update if exists
            imageUrl: user.imageUrl,
            firstName: user.firstName,
            lastName: user.lastName,
        },
        create: { //  // create if not
            id: userId,
            emailAddress: user.emailAddresses[0]?.emailAddress ?? "",
            imageUrl: user.imageUrl,
            firstName: user.firstName,
            lastName: user.lastName,
        },
    })
    return redirect('/dashboard')

}

export default SyncUser