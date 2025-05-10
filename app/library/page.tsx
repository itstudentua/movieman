import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import LibraryComponent from './LibraryComponent'

const MyLibrary = async () => {
	const session = await getServerSession(authOptions)

	
	return (
		<LibraryComponent session={session} />
	)
}

export default MyLibrary
