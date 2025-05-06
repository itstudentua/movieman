'use client'

import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils' // если используешь shadcn
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { mutate } from 'swr'
import { UserMedia } from '@prisma/client'


import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from '@/components/ui/select'
import ListMenuBlock from './general/ListMenuBlock'

type Movie = {
	id: number
	title: string
	overview: string
	poster_path: string
	backdrop_path: string
	vote_average: number
	release_date: string
}

type Props = {
	allMovies: {
		trending: Movie[]
		topRated: Movie[]
		upcoming: Movie[]
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
	const movies = allMovies[category]

	const { data: session } = useSession()


	const autoSlideRef = useRef<NodeJS.Timeout | null>(null)

	const resetAutoSlide = () => {
		if (autoSlideRef.current) {
			clearInterval(autoSlideRef.current)
		}
		autoSlideRef.current = setInterval(() => {
			nextSlide(false)
		}, 10000)
	}

	const nextSlide = (manual = true) => {
		setIndex(prev => (prev + 1) % movies.length)
		if (manual) resetAutoSlide()
	}

	const prevSlide = (manual = true) => {
		setIndex(prev => (prev - 1 + movies.length) % movies.length)
		if (manual) resetAutoSlide()
	}

	// авто-слайд
	useEffect(() => {
		resetAutoSlide()
		return () => {
			if (autoSlideRef.current) clearInterval(autoSlideRef.current)
		}
	}, [])

	const movie = movies[index]
	
	const { data, error, isLoading } = useSWR(`/api/db`, fetcher, {
		revalidateOnFocus: true,
	})
    
	console.log(movies)

	function useMediaFlags(data: any[], mediaId: number): MediaFlags | null {
		
			const item = data.find(entry => entry.mediaId === mediaId)
			if (!item) return null

			return {
				isWatched: item.isWatched,
				isWishlist: item.isWishlist,
				isFavorite: item.isFavorite,
			}
	}

	async function updateMovie(media: any) {
		await fetch('/api/db', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				mediaId: media.id,
				type: media.media_type || "movie",
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


	if (!movies || movies.length === 0 || isLoading) {
		return (
			<div className='fixed inset-0 z-100 bg-black flex items-center justify-center'>
				<span className='text-white text-xl animate-pulse'>
					Loading...
				</span>
			</div>
		)
	}

	

	return (
		<>
			<div className='relative w-full min-h-full overflow-hidden flex flex-col justify-between items-center py-3 sm:py-5'>
				<div className='mobile-header px-3 sm:px-10 z-22 w-full sm:w-fit'>
					<Select
						value={category}
						onValueChange={val => {
							setCategory(val as any)
							setIndex(0)
							resetAutoSlide()
						}}
					>
						<SelectTrigger className='w-[180px] bg-black text-white border-white/20 cursor-pointer hover:opacity-50'>
							<SelectValue placeholder='Category' />
						</SelectTrigger>
						<SelectContent className='bg-black text-white'>
							<SelectItem value='trending'>
								🔥 Trending
							</SelectItem>
							<SelectItem value='topRated'>
								🏆 Top rated
							</SelectItem>
							<SelectItem value='upcoming'>
								🎬 Upcoming
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
				{/* Фон */}
				<AnimatePresence mode='wait'>
					<motion.div
						key={movie.id}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.8 }}
						className='absolute inset-0 hidden sm:block'
					>
						<Image
							src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
							alt={movie.title}
							fill
							className='object-cover'
						/>
						<div className='absolute inset-0 bg-white/50 dark:bg-black/70' />
					</motion.div>
				</AnimatePresence>

				{/* Контент */}
				<div className='relative z-20 flex h-full items-center justify-center px-6 md:px-16'>
					<div className='flex flex-col md:flex-row items-center gap-8 max-w-6xl w-full h-full'>
						{/* Постер */}
						<motion.div
							key={movie.poster_path}
							initial={{ opacity: 0, x: -50 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
							className='w-[250px] flex-shrink-0 hidden sm:block mt-5'
						>
							<Link
								key={movie.id}
								href={`/movie/${movie.id}`}
								className='shadow hover:shadow-lg transition hover:opacity-50'
							>
								<Image
									src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
									alt={movie.title}
									width={250}
									height={375}
									className='rounded-xl shadow-lg'
								/>
							</Link>
						</motion.div>

						{/* Текст */}
						<motion.div
							key={movie.title}
							initial={{ opacity: 0, x: 50 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
							className='h-full flex flex-col gap-2'
						>
							<Link
								key={movie.id}
								href={`/movie/${movie.id}`}
								className='w-fit transition hover:opacity-50'
							>
								<h1 className='text-3xl md:text-5xl font-bold'>
									{movie.title}
								</h1>
							</Link>

							<motion.div
								key={movie.poster_path}
								initial={{ opacity: 0, x: -50 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.8 }}
								className='w-[250px] flex-shrink-0 block sm:hidden self-center'
							>
								<Link
									key={movie.id}
									href={`/movie/${movie.id}`}
									className='shadow hover:shadow-lg transition hover:opacity-50'
								>
									<Image
										src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
										alt={movie.title}
										width={250}
										height={375}
										priority
										className='rounded-xl shadow-lg'
									/>
								</Link>
							</motion.div>

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
								{movie.vote_average > 0 &&
									`Global rating: ${movie.vote_average.toFixed(
										1
									)} ⭐`}
							</p>
							{session?.user.id && (
								<ListMenuBlock
									mediaId={movie.id}
									addUserMedia={() => updateMovie(movie)}
									watchedButton={category !== 'upcoming'}
									isWatched={
										useMediaFlags(data, movie.id)?.isWatched
									}
									isWishlist={
										useMediaFlags(data, movie.id)
											?.isWishlist
									}
									isFavorite={
										useMediaFlags(data, movie.id)
											?.isFavorite
									}
									setIsWishlist={() =>
										updateMovie({
											...movie,
											isWishlist: !useMediaFlags(
												data,
												movie.id
											)?.isWishlist,
										})
									}
									setIsFavorite={() =>
										updateMovie({
											...movie,
											isFavorite: !useMediaFlags(
												data,
												movie.id
											)?.isFavorite,
										})
									}
									setIsWatched={() =>
										updateMovie({
											...movie,
											isWatched: !useMediaFlags(
												data,
												movie.id
											)?.isWatched,
										})
									}
								/>
							)}
						</motion.div>
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
