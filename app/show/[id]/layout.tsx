// pages/show/[id]/page.tsx
import { notFound } from 'next/navigation'
import { getShow } from '@/utils/api'

type Params = Promise<{ id: string }>

// Функция для асинхронной загрузки метаданных
export async function generateMetadata({ params }: { params: Params }) {
	// Ждем данные фильма по id, перед тем как использовать его в метаданных
	const { id } = await params
	const show = await getShow(id)

	return {
		title: 'MovieMan: ' + show?.name || 'Movie not found',
		description: show?.overview || 'No description available.',
	}
}
const ShowPage = async ({ params, children }: { params: Params, children: React.ReactNode }) => {
	const { id } = await params
	const show = await getShow(id)


	if (!show) {
		return notFound()
	}

	return (
		<>
            {children}
		</>
	)
}

export default ShowPage
