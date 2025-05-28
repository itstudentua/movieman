'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils' // если используешь shadcn
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { mutate } from 'swr'
import dynamic from 'next/dynamic'

const MainPageSelect = dynamic(() => import('./MainPageSelect'))

const MotionDiv = dynamic(() =>
	import('framer-motion').then(mod => mod.motion.div)
)

const AnimatePresence = dynamic(() =>
	import('framer-motion').then(mod => mod.AnimatePresence)
)

const ListMenuBlock = dynamic(() => import('../general/ListMenuBlock'))

const DynamicImage = dynamic(() => import('next/image'))

const DynamicLink = dynamic(() => import('next/link'))

import { CommonMedia } from '@/lib/movieTypes'

type Props = {
	allMovies: {
		trending: CommonMedia[]
		topRated: CommonMedia[]
		upcoming: CommonMedia[]
	}
}

type MediaFlags = {
	isWatched: boolean
	isWishlist: boolean
	isFavorite: boolean
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function FullScreenCarousel({ allMovies }: Props) {
	const [index, setIndex] = useState(0)
	const [category, setCategory] = useState<
		'trending' | 'topRated' | 'upcoming'
	>('trending')
	const [isPaused, setIsPaused] = useState(false)
	const [isActive, setIsActive] = useState(false) // включен ли список, чтобы блокировать автопрокрутку

	const movies = useMemo(() => allMovies[category], [allMovies, category])
	const movie = movies[index]

	console.log(movies);
	

	const { data: session } = useSession()

	const autoSlideRef = useRef<NodeJS.Timeout | null>(null)

	const resetAutoSlide = () => {
		if (autoSlideRef.current) {
			clearInterval(autoSlideRef.current)
		}
		if (!isPaused) {
			autoSlideRef.current = setInterval(() => {
				nextSlide(false)
			}, 7000)
		}
	}

	const nextSlide = (manual = true) => {
		setIndex(prev => (prev + 1) % movies.length)
		if (manual) resetAutoSlide()
	}

	const prevSlide = (manual = true) => {
		setIndex(prev => (prev - 1 + movies.length) % movies.length)
		if (manual) resetAutoSlide()
	}

	useEffect(() => {
		if (!isPaused) {
			resetAutoSlide()
		}
		return () => {
			if (autoSlideRef.current) clearInterval(autoSlideRef.current)
		}
	}, [isPaused])

	const { data, isLoading } = useSWR(`/api/db`, fetcher, {
		revalidateOnFocus: true,
	})

	function getMediaFlags(
		data: CommonMedia[] | undefined,
		mediaId: number
	): MediaFlags | null {
		if (!Array.isArray(data) || !session?.user.id) {
			return null
		}

		const item = data.find(entry => entry.mediaId === mediaId)
		if (!item) return null

		return {
			isWatched: item.isWatched ?? false,
			isWishlist: item.isWishlist ?? false,
			isFavorite: item.isFavorite ?? false,
		}
	}

	const flags = getMediaFlags(data, movie.id as number)

	async function updateMovie(media: CommonMedia) {
		await fetch('/api/db', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				mediaId: media.id,
				type: media.media_type || 'movie',
				title: media?.name || media?.title,
				year: media?.first_air_date
					? parseInt(media.first_air_date.split('-')[0]) // Для сериалов
					: media?.release_date
					? parseInt(media.release_date.split('-')[0]) // Для фильмов
					: null,

				poster: media.poster_path,
				rating: media.vote_average,
				description: media.overview,
				isWatched: media.isWatched,
				isFavorite: media.isFavorite,
				isWishlist: media.isWishlist,
			}),
		})

		await mutate(`/api/db`)
	}

	const dateStr = movie.release_date || movie?.first_air_date
	const watchedButton = Boolean(
		dateStr && new Date(dateStr).getTime() < Date.now()
	)

	if (!movies || movies.length === 0 || isLoading) {
		return (
			<div className='fixed inset-0 z-100 bg-white dark:bg-black flex items-center justify-center'>
				<span className='text-black dark:text-white text-xl animate-pulse'>
					Loading...
				</span>
			</div>
		)
	}

	return (
		<>
			<div className='relative w-full min-h-full overflow-hidden flex flex-col justify-between items-center py-3 sm:py-5'>
				<div className='mobile-header px-3 sm:px-10 z-22 w-full sm:w-fit'>
					<MainPageSelect
						category={category}
						setCategory={setCategory}
						setIndex={setIndex}
						resetAutoSlide={resetAutoSlide}
					/>
				</div>
				{/* Фон */}
				<AnimatePresence mode='wait'>
					<MotionDiv
						key={movie.id}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.8 }}
						className='absolute inset-0 hidden sm:block'
					>
						<DynamicImage
							src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
							alt={movie.title as string}
							fill
							className='object-cover'
							priority
						/>
						<div className='absolute inset-0 bg-white/70 dark:bg-black/70' />
					</MotionDiv>
				</AnimatePresence>

				{/* Контент */}
				<div
					onPointerEnter={() => setIsPaused(true)}
					onPointerLeave={() => setIsPaused(isActive ? true : false)}
					className='relative z-20 flex h-full items-center justify-center px-6 md:px-16'
				>
					<div className='flex flex-col md:flex-row items-center gap-8 max-w-6xl w-full h-full'>
						{/* Постер */}
						<MotionDiv
							key={movie.poster_path}
							initial={{ opacity: 0, x: -50 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
							className='w-[250px] flex-shrink-0 hidden sm:block mt-5'
						>
							<DynamicLink
								prefetch={true}
								key={movie.id}
								href={`/movie/${movie.id}`}
								className='shadow hover:shadow-lg transition hover:opacity-50'
							>
								<DynamicImage
									src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
									alt={movie.title as string}
									width={250}
									height={375}
									className='rounded-xl shadow-lg'
									priority
								/>
							</DynamicLink>
						</MotionDiv>

						{/* Текст */}
						<MotionDiv
							key={movie.title}
							initial={{ opacity: 0, x: 50 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
							className='h-full flex flex-col gap-2'
						>
							<DynamicLink
								prefetch={true}
								key={movie.id}
								href={`/movie/${movie.id}`}
								className='w-fit transition hover:opacity-50'
							>
								<h1 className='text-3xl md:text-5xl font-bold'>
									{movie.title}
								</h1>
							</DynamicLink>

							<MotionDiv
								key={movie.poster_path}
								initial={{ opacity: 0, x: -50 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.8 }}
								className='w-[250px] flex-shrink-0 block sm:hidden self-center'
							>
								<DynamicLink
									prefetch={true}
									key={movie.id}
									href={`/movie/${movie.id}`}
									className='shadow hover:shadow-lg transition hover:opacity-50'
								>
									<DynamicImage
										src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
										alt={movie.title as string}
										width={250}
										height={375}
										priority
										className='rounded-xl shadow-lg'
									/>
								</DynamicLink>
							</MotionDiv>

							<p className='mt-5 text-gray-900 dark:text-gray-300 text-base md:text-lg line-clamp-2 sm:line-clamp-5'>
								{movie.overview}
							</p>
							<p>
								{movie.release_date &&
									`🎥 Release date: ${movie.release_date
										.split('-')
										.join('.')}`}
							</p>
							<p className='text-yellow-800 dark:text-yellow-400 text-md'>
								{movie.vote_average
									? movie.vote_average > 0 &&
									  `Global rating: ${movie.vote_average.toFixed(
											1
									  )} ⭐`
									: null}
							</p>
							{session?.user.id && (
								<ListMenuBlock
									setIsActive={setIsActive}
									setIsPaused={setIsPaused}
									mediaId={movie.id}
									addUserMedia={() => updateMovie(movie)}
									watchedButton={watchedButton}
									isWatched={flags?.isWatched}
									isWishlist={flags?.isWishlist}
									isFavorite={flags?.isFavorite}
									setIsWishlist={() =>
										updateMovie({
											...movie,
											isWishlist: !flags?.isWishlist,
										})
									}
									setIsFavorite={() =>
										updateMovie({
											...movie,
											isFavorite: !flags?.isFavorite,
										})
									}
									setIsWatched={() =>
										updateMovie({
											...movie,
											isWatched: !flags?.isWatched,
										})
									}
								/>
							)}
						</MotionDiv>
					</div>
				</div>

				{/* Стрелки */}
				<div className='absolute top-1/2 left-1 sm:left-2 -translate-y-1/2 z-30'>
					<button
						onClick={() => prevSlide(true)}
						className='text-white p-2 bg-black/40 rounded-full hover:bg-white/20 cursor-pointer'
					>
						<ChevronLeft className='w-5 h-5 sm:w-8 sm:h-8' />
					</button>
				</div>
				<div className='absolute top-1/2 right-1 sm:right-2 -translate-y-1/2 z-30'>
					<button
						onClick={() => nextSlide(true)}
						className='text-white p-2 bg-black/40 rounded-full hover:bg-white/20 cursor-pointer'
					>
						<ChevronRight className='w-5 h-5 sm:w-8 sm:h-8' />
					</button>
				</div>
				{/* Dots */}
				<div className='z-30 flex gap-2 flex-wrap sm:flex-nowrap pt-5 px-5 justify-center'>
					{movies.map((_, i) => (
						<button
							key={i}
							onClick={() => {
								setIndex(i)
								resetAutoSlide()
							}}
							className={cn(
								'w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all cursor-pointer hover:opacity-50',
								i === index
									? 'bg-gray-200 dark:bg-white'
									: 'bg-black dark:bg-white/40'
							)}
						/>
					))}
				</div>
			</div>
		</>
	)
}
