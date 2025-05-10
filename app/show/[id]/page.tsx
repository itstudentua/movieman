// pages/show/[id]/page.tsx
import { notFound } from 'next/navigation'
import { getShow } from '@/utils/api'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import MediaClientComponent from '@/components/mediapage/MediaClientComponent'


type Params = Promise<{ id: string }>


const ShowPage = async ({ params }: { params: Params }) => {
	const { id } = await params
	const show = await getShow(id)
	const session = await getServerSession(authOptions)
	
	if (!show) {
		return notFound()
	}

	return (
<MediaClientComponent
		media={{ ...show, media_type: 'tv' }}
		session={session}
	/>	)
}

export default ShowPage


