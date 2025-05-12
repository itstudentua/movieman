import FullScreenCarousel from '@/components/mainpage/FullScreenCarousel'
import { getPopularMovies } from '@/utils/api'

export default async function Home() {
	const trending = await getPopularMovies('trending')
	const topRated = await getPopularMovies('top_rated')
	const upcoming = await getPopularMovies('upcoming')
	const all = {
		trending,
		topRated,
		upcoming,
	}

	return (
		<main className='h-full w-full'>
			<FullScreenCarousel allMovies={all} />
		</main>
	)
}
