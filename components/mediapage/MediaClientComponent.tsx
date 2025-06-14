'use client'

import { Session } from 'next-auth'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const MediaHeader = dynamic(() => import('./MediaHeader'))
const MediaCast = dynamic(() => import('./MediaCast'))
const MediaCommentary = dynamic(() => import('./MediaCommentary'))
const MediaRecommendations = dynamic(() => import('./MediaRecommendations'))

import { CommonMedia } from '@/lib/movieTypes'
import LoadingPage from '../general/Loader'

export default function ShowClientComponent({
	media,
	session,
}: {
	media: CommonMedia
	session: Session | null
}) {
	const [date, setDate] = useState<Date | undefined>()
	const [isWatched, setIsWatched] = useState<boolean>(false)
	const [isFavorite, setIsFavorite] = useState<boolean>(false)
	const [isWishlist, setIsWishlist] = useState<boolean>(false)
	const [userRating, setUserRating] = useState(-69)
	const [userComment, setUserComment] = useState<string>('')

	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		let isMounted = true

		const fetchMedia = async () => {
			try {
				setIsLoading(true)
				const res = await fetch(`/api/db?type=${media?.media_type}`)
				const data = await res.json()

				const filtered = data.filter(
					(item: { userId: string; mediaId: number }) =>
						item.userId === session?.user?.id &&
						item.mediaId === media.id
				)

				if (isMounted) {
					setDate(filtered[0]?.watchedDate)
					setIsWatched(filtered[0]?.isWatched)
					setIsFavorite(filtered[0]?.isFavorite)
					setIsWishlist(filtered[0]?.isWishlist)
					setUserRating(filtered[0]?.userRating)
					setUserComment(filtered[0]?.userComment)
					setIsLoading(false)
				}
			} catch (error) {
				if (isMounted) {
					console.error('Ошибка при загрузке данных:', error)
					setIsLoading(false)
				}
			}
		}

		if (session?.user?.id) {
			fetchMedia()
		}

		return () => {
			isMounted = false
		}
	}, [session?.user?.id, media.id, media?.media_type])


	const handleClick = async () => {
		if (userRating !== -69) {
			setIsLoading(true)
			await fetch('/api/db', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					mediaId: media.id,
					type: media.media_type,
					title: media?.name || media?.title,
					year: media?.first_air_date
						? parseInt(media.first_air_date.split('-')[0]) // Для сериалов
						: media?.release_date
						? parseInt(media.release_date.split('-')[0]) // Для фильмов
						: null,

					poster: media.poster_path,
					userRating: userRating,
					userComment: userComment,
					rating: media.vote_average,
					description: media.overview,
					isWatched: isWatched,
					isFavorite: isFavorite,
					isWishlist: isWishlist,

					watchedDate: date,
				}),
			})
			setTimeout(() => {
				setIsLoading(false)
			}, 300)
		}
	}

	useEffect(() => {
		if (!session?.user?.id) {
			const timeout = setTimeout(() => {
				setIsLoading(false)
			}, 300)

			return () => clearTimeout(timeout)
		}
	}, [session?.user?.id])


	const mediaProps = {
		date,
		setDate,
		media,
		session,
		isWatched,
		setIsWatched,
		isFavorite,
		setIsFavorite,
		isWishlist,
		setIsWishlist,
		userRating,
		setUserRating,
		handleClick,
	}


	return (
		<>
			{isLoading && (
				<LoadingPage />
			)}
			<div className='w-full relative'>
				<MediaHeader mediaProps={mediaProps} />

				<div className='px-3 sm:px-10 max-w-7xl mx-auto mt-5 pb-10'>
					{Array.isArray(media?.credits?.cast) &&
						media.credits.cast.length > 0 && (
							<MediaCast
								cast={media.credits.cast}
								mediaType={media.media_type as string}
							/>
						)}

					<MediaCommentary
						userComment={userComment}
						setUserComment={setUserComment}
						handleClick={handleClick}
						isWatched={isWatched}
					/>

					{Array.isArray(media?.recommendations?.results) &&
						media.recommendations.results.length > 0 && (
							<MediaRecommendations
								recommendation={media.recommendations.results}
								type='media'
							/>
						)}
				</div>
			</div>
		</>
	)
}
