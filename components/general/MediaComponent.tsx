'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/formatDate'
import MoviesPageSelect from './MediaPageSelect'
import { CommonMedia } from '@/lib/movieTypes'

export default function MediaComponent({ mediaType }: { mediaType: string }) {
	const [page, setPage] = useState(1)
	const [allMedia, setAllMedia] = useState<CommonMedia[]>([])
	const [categoryOfMedia, setCategoryOfMedia] = useState<
		'popular' | 'top_rated' | 'upcoming' | 'on_the_air' | 'airing_today'
	>('top_rated')

	// Используем наш API-роут для загрузки данных
	const { data, error, isLoading } = useSWR(
		[categoryOfMedia, page],
		() =>
			fetch(
				`/api/get-movies/?page=${page}&category=${categoryOfMedia}&type=${mediaType}`
			).then(res => res.json()),
		{
			onSuccess: data => {
				if (page !== 0) {
					setAllMedia(prev => [...prev, ...data.results])
				}
			},
			revalidateOnFocus: false,
		}
	)

	const loadMore = () => {
		if (data?.total_pages && page < data.total_pages) {
			setPage(prev => prev + 1)
		}
	}

	console.log(allMedia)

	function getPageTitle(
		category: string,
		mediaType: string
	): string {
		if (mediaType === 'movie') {
			switch (category) {
				case 'top_rated':
					return '🏆 Top Rated Movies'
				case 'popular':
					return '🔥 Trending Movies'
				case 'upcoming':
					return '🎯 Upcoming Movies'
				default:
					return '🎬 Movies'
			}
		} else {
			switch (category) {
				case 'top_rated':
					return '🏆 Top Rated TV Shows'
				case 'popular':
					return '🔥 Trending TV Shows'
				case 'on_the_air':
					return '📡 Currently Airing TV Shows'
				case 'airing_today':
					return '📺 Airing Today'
				default:
					return '📺 TV Shows'
			}
		}
	}
	

	if (error) return <p className='text-red-500'>Error.</p>

	if (isLoading && page < 2)
		return (
			<div className='fixed inset-0 z-100 bg-white dark:bg-black flex items-center justify-center'>
				<span className='text-black dark:text-white text-xl animate-pulse'>
					Loading...
				</span>
			</div>
		)


	return (
		<div className='px-3 sm:px-10 max-w-7xl mx-auto mt-5 pb-10'>
			<div className='w-full flex justify-center'>
				<MoviesPageSelect
					setAllMedia={setAllMedia}
					setPage={setPage}
					category={categoryOfMedia}
					setCategory={setCategoryOfMedia}
					mediaType={mediaType}
				/>
			</div>
			<h1 className='text-xl font-bold mb-4'>
				{getPageTitle(categoryOfMedia, mediaType)}
			</h1>

			<div className='flex flex-wrap gap-5 justify-center'>
				{allMedia.map(media => (
					<Link
						href={`/movie/${media.id}`}
						key={`${media.id} ${categoryOfMedia}`}
						className='border-1 p-2 rounded-lg cursor-pointer hover:opacity-50'
					>
						<Image
							src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
							alt={
								(media.title as string) ||
								(media.name as string)
							}
							width={200}
							height={300}
							className='rounded'
						/>
						<p className='mt-2 text-gray-400 text-sm'>
							Release:{' '}
							{formatDate(
								media?.release_date || media.first_air_date
							)}
						</p>

						<p className='mt-1 text-md w-50 overflow-hidden text-ellipsis whitespace-nowrap'>
							{media.title || media.name}
						</p>
					</Link>
				))}
			</div>

			<div className='text-center mt-6'>
				{isLoading ? (
					<p>Loading...</p>
				) : (
					data?.page < data?.total_pages && (
						<button
							onClick={loadMore}
							className=' cursor-pointer font-semibold bg-black dark:bg-white dark:text-black hover:opacity-45 text-white px-4 py-2 rounded'
						>
							Load more
						</button>
					)
				)}
			</div>
		</div>
	)
}
