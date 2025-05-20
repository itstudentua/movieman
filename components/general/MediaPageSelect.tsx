import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from '@/components/ui/select'

type Movie = {
	id: number
	title: string
	poster_path: string
	release_date: string
}

type Props = {
	category:
		| 'popular'
		| 'top_rated'
		| 'upcoming'
		| 'on_the_air'
		| 'airing_today'

	setCategory: (
		val:
			| 'popular'
			| 'top_rated'
			| 'upcoming'
			| 'on_the_air'
			| 'airing_today'
	) => void
	setAllMedia: (movies: Movie[]) => void
	setPage: (val: number) => void
	mediaType: string
}


export default function MediaPageSelect({
	category,
	setCategory,
	setAllMedia,
	setPage,
	mediaType
}: Props) {
	return (
		<Select
			value={category}
			onValueChange={val => {
				setCategory(
					val as
						| 'popular'
						| 'top_rated'
						| 'upcoming'
						| 'on_the_air'
						| 'airing_today'
				)
				setAllMedia([])
				setPage(1)
			}}
		>
			<SelectTrigger className='w-fit bg-black text-white border-white/20 cursor-pointer hover:opacity-50'>
				<SelectValue placeholder='Category' />
			</SelectTrigger>
			<SelectContent className='bg-black text-white'>
				{mediaType === 'tv' ? (
					<>
						<SelectItem value='on_the_air'>🔥 Trending</SelectItem>
						<SelectItem value='top_rated'>🏆 Top rated</SelectItem>
						<SelectItem value='airing_today'>
							🎬 Airing today
						</SelectItem>
					</>
				) : (
					<>
						<SelectItem value='popular'>🔥 Trending</SelectItem>
						<SelectItem value='top_rated'>🏆 Top rated</SelectItem>
						<SelectItem value='upcoming'>🎬 Upcoming</SelectItem>
					</>
				)}
			</SelectContent>
		</Select>
	)
}
