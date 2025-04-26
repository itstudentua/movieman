// pages/show/[id]/page.tsx
import { notFound } from 'next/navigation'
import { getMovie } from '@/utils/api'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import MediaClientComponent from '@/components/mediapage/MediaClientComponent'

type Params = Promise<{ id: string }>

const MoviePage = async ({ params }: { params: Params }) => {
	const { id } = await params
	const movie = await getMovie(id)
	const session = await getServerSession(authOptions)
	
	if (!movie) {
		return notFound()
	}

return (
	<MediaClientComponent
		media={{ ...movie, media_type: 'movie' }}
		session={session}
	/>
)
}

export default MoviePage
