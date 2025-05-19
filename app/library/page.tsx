import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import LibraryComponent from './LibraryComponent'
import { Session } from 'next-auth'

const MyLibrary = async () => {
	const session = await getServerSession(authOptions)

	return <LibraryComponent session={session as Session} />
}

export default MyLibrary
