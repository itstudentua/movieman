'use client'

import { useEffect, useState } from 'react'
import { Session } from 'next-auth'

import dynamic from 'next/dynamic'

const Link = dynamic(() => import('next/link'))
const Image = dynamic(() => import('next/image'))
const MediaHeaderSelect = dynamic(() => import('./MediaHeaderSelect'))
const ListMenuBlock = dynamic(() => import('../general/ListMenuBlock'))
const MediaCalendar = dynamic(() => import('./MediaCalendar'))

type MediaProps = {
	media: any
	session: Session | null
	date: Date | undefined
	setDate: (date: Date | undefined) => void
	isWatched: boolean
	setIsWatched: React.Dispatch<React.SetStateAction<boolean>>
	isFavorite: boolean
	setIsFavorite: React.Dispatch<React.SetStateAction<boolean>>
	isWishlist: boolean
	setIsWishlist: React.Dispatch<React.SetStateAction<boolean>>
	userRating: number
	setUserRating: React.Dispatch<React.SetStateAction<number>>
	handleClick: () => Promise<void>
}

export default function MediaPoster({
	mediaProps,
}: {
	mediaProps: MediaProps
}) {
	const {
		media,
		session,
		date,
		setDate,
		isWatched,
		setIsWatched,
		isFavorite,
		setIsFavorite,
		isWishlist,
		setIsWishlist,
		userRating,
		setUserRating,
		handleClick,
	} = mediaProps

	const [isRefresh, setIsRefresh] = useState(false)

	useEffect(() => {
		// alert(isRefresh)
		if (isRefresh) {
			handleClick()
		}
	}, [isWatched, isFavorite, isWishlist, userRating, date])

	const [imagePath, setImagePath] = useState<string>('') // Храним путь к изображению

	useEffect(() => {
		// Функция для обновления пути в зависимости от ширины экрана
		const updateImagePath = () => {
			const isWide = window.innerWidth >= 768 // Проверяем, широкий ли экран
			const newImagePath = isWide
				? media.backdrop_path
				: media.images?.posters?.[1]?.file_path || media.backdrop_path
			setImagePath(newImagePath) // Обновляем состояние
		}

		updateImagePath() // Вызываем сразу для начальной установки

		window.addEventListener('resize', updateImagePath) // Обновляем при изменении размера экрана
		return () => window.removeEventListener('resize', updateImagePath) // Убираем обработчик при размонтировании
	}, [])

	const getYears = () => {
		const startYear = media.first_air_date?.split('-')[0] || ''
		const endYear = !media.in_production
			? media.last_air_date?.split('-')[0]
			: ''
		return `${startYear}${endYear ? '-' + endYear : ''}`
	}

	const getRuntime = () => {
		const minutes = media.runtime || 0
		const hours = Math.floor(minutes / 60)
		const mins = minutes % 60
		const finalRes = `${hours ? `${hours}h ` : ''}${
			mins ? `${mins}m` : ''
		}`.trim()
		return finalRes ? `(${finalRes})` : ''
	}

	return (
		<div
			className='w-full bg-no-repeat bg-cover'
			style={{
				backgroundImage: `url(https://image.tmdb.org/t/p/original${imagePath})`,
				//backgroundImage: `url(${backgroundUrl})`,
				backgroundPosition: 'center',
			}}
		>
			<div className='w-full dark:bg-black/80 bg-white/80  flex items-center justify-center py-5 sm:py-10 text-white'>
				<div className='px-3 sm:px-10 max-w-7xl mx-auto'>
					<div className='flex gap-10 md:flex-row items-center flex-col'>
						{media.poster_path && (
							<div className='relative hidden md:block w-[300px] aspect-[2/3] flex-shrink-0'>
								<Image
									src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
									alt={media.name || media.title}
									fill
									sizes='(max-width: 768px) 200px auto, (max-width: 1200px) 300px auto'
									className='object-cover rounded-lg shadow-2xl'
									priority
								/>
							</div>
						)}
						<div className='flex flex-col pt-3 w-full text-black dark:text-white'>
							<h1 className='text-3xl font-bold leading-none'>
								{media.name || media.title}{' '}
								<span className=' text-lg text-gray-900 dark:text-gray-500 font-normal whitespace-nowrap'>
									{media?.media_type === 'movie' &&
										getRuntime()}
								</span>
							</h1>

							<p className='text-lg text-gray-700 dark:text-gray-400'>
								{media?.media_type === 'tv'
									? getYears()
									: media?.release_date.split('-')[0] || ''}
							</p>
							<p className='text-lg text-gray-900 dark:text-gray-500'>
								{media?.genres
									?.map(
										(genre: { name: string }) => genre.name
									)
									.join(', ')}
							</p>
							{media.poster_path && (
								<div className='my-3 relative block md:hidden w-[80%] aspect-[2/3] flex-shrink-0'>
									<Image
										src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
										alt={media.name || media.title}
										fill
										sizes='(max-width: 768px) 200px, (max-width: 1200px) 250px, 300px'
										className='object-cover rounded-lg shadow-2xl'
										priority
									/>
								</div>
							)}
							<p className='text-gray-700 dark:text-gray-400 text-lg'>
								{media?.origin_country
									.map((item: any) => item)
									.join(', ')}
								{media?.media_type === 'tv'
									? media?.number_of_seasons.length === 1
										? `, ${media?.number_of_seasons} season, ${media?.number_of_episodes} episodes`
										: `, ${media?.number_of_seasons} seasons, ${media?.number_of_episodes} episodes`
									: null}
							</p>
							{media?.vote_average !== 0 && (
								<p>
									Global Rating:{' '}
									{media?.vote_average.toFixed(1)} ⭐️
								</p>
							)}
							{session?.user && isWatched && (
								<div className='mt-2 flex flex-col bg-white/80 text-black w-fit rounded-lg p-2'>
									<div className='flex gap-2 items-center'>
										<label className='font-medium'>
											My rating:{' '}
											{userRating && `${userRating} ⭐️`}
										</label>
										<MediaHeaderSelect
											setIsRefresh={setIsRefresh}
											setUserRating={setUserRating}
											userRating={userRating}
										/>
									</div>
									<MediaCalendar 
										date={date}
										setDate={setDate}
										setIsRefresh={setIsRefresh}
									/>
								</div>
							)}
							<p className='italic text-gray-700 dark:text-gray-400 mt-2'>
								{media?.tagline}
							</p>

							{session?.user && (
								<ListMenuBlock
									mediaId={media.id}
									setIsRefresh={setIsRefresh}
									watchedButton={
										new Date(
											media.release_date ||
												media.first_air_date
										).getTime() < Date.now()
									}
									addUserMedia={handleClick}
									isWatched={isWatched}
									isFavorite={isFavorite}
									isWishlist={isWishlist}
									setIsWatched={setIsWatched}
									setIsFavorite={setIsFavorite}
									setIsWishlist={setIsWishlist}
								/>
							)}

							{media?.overview && (
								<OverViewSection media={media} />
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

function OverViewSection({ media }: { media: any }) {
	return (
		<>
			<h3 className='mt-3 mb-1 text-xl font-semibold'>Overview</h3>
			<p className=''>{media.overview}</p>
			<div className='mt-5'>
				<ul className='flex gap-5 flex-wrap'>
					{media?.media_type === 'tv' &&
						media?.created_by?.slice(0, 3).map((creator: any) => (
							<li
								key={creator?.id}
								className='dark:text-gray-400 text-gray-800 text-sm'
							>
								<Link href={`/people/${creator?.id}`}>
									<span className='text-xl text-black dark:text-white font-semibold'>
										{creator?.name}
									</span>
								</Link>
								<br />
								Creator
							</li>
						))}

					{media?.media_type === 'movie' &&
						media?.credits?.crew
							?.filter((person: any) =>
								['Director', 'Writer', 'Screenplay'].includes(
									person.job
								)
							)
							.slice(0, 3)
							.map((person: any) => (
								<li
									key={person?.id + person?.job}
									className='dark:text-gray-400 text-gray-800 text-sm'
								>
									<Link href={`/people/${person.id}`}>
										<span className='text-xl text-black dark:text-white font-semibold'>
											{person?.name}
										</span>
									</Link>
									<br />
									{/* Объединяем 'Writer' и 'Screenplay' в одну роль */}
									{person.job === 'Screenplay' ||
									person.job === 'Writer'
										? 'Writer'
										: person.job}
								</li>
							))}
				</ul>
			</div>
		</>
	)
}
