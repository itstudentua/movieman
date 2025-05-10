// pages/show/[id]/page.tsx
import { notFound } from 'next/navigation'
import { getMovie } from '@/utils/api'

type Params = Promise<{ id: string }>

// Функция для асинхронной загрузки метаданных
export async function generateMetadata({ params }: { params: Params }) {
    // Ждем данные фильма по id, перед тем как использовать его в метаданных
    const { id } = await params
    const movie = await getMovie(id)

    return {
        title: 'MovieMan: ' + movie?.title || 'Movie not found',
        description: movie?.overview || 'No description available.',
    }
}
const MoviePage = async ({ params, children }: { params: Params, children: React.ReactNode }) => {
    const { id } = await params
    const movie = await getMovie(id)


    if (!movie) {
        return notFound()
    }

    return (
        <>
            {children}
        </>
    )
}

export default MoviePage
