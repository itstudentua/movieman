'use client'

import { Session } from 'next-auth'
import MediaHeader from './MediaHeader'
import MediaCast from './MediaCast'
import MediaCommentary from './MediaCommentary'
import MediaRecommendation from './MediaRecommendations'
import { useEffect, useState } from 'react'

export default function ShowClientComponent({
	media,
	session,
}: {
	media: any
	session: Session | null
}) {
	const [date, setDate] = useState<Date | undefined>()
	const [mediaInfo, setMediaInfo] = useState([])
	const [isWatched, setIsWatched] = useState<boolean>(false)
	const [isFavorite, setIsFavorite] = useState<boolean>(false)
	const [isWishlist, setIsWishlist] = useState<boolean>(false)
	const [userRating, setUserRating] = useState(-69)
	const [userComment, setUserComment] = useState<string>('')

	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchMedia = async () => {
			try {
				setIsLoading(true)
				const res = await fetch(`/api/db?type=${media?.media_type}`)
				const data = await res.json()

				// фильтрация по текущему пользователю и show
				const filtered = data.filter(
					(item: any) =>
						item.userId === session?.user?.id &&
						item.mediaId === media.id
				)
				setDate(filtered[0]?.watchedDate)
				setMediaInfo(filtered)
				setIsWatched(filtered[0]?.isWatched)
				setIsFavorite(filtered[0]?.isFavorite)
				setIsWishlist(filtered[0]?.isWishlist)
				setUserRating(filtered[0]?.userRating)
				setUserComment(filtered[0]?.userComment)
			} catch (error) {
				console.error('Ошибка при загрузке данных:', error)
				setIsLoading(false)
			}
			setIsLoading(false)
		}

		if (session?.user?.id) {
			fetchMedia()
		}
	}, [session?.user?.id, media.id])

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


	if (!session?.user?.id) {
		setTimeout(() => {
			setIsLoading(false)
		}, 300)
	}

	
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
				<div className='fixed inset-0 z-100 bg-black flex items-center justify-center'>
					<span className='text-white text-xl animate-pulse'>
						Loading...
					</span>
				</div>
			)}
			<div className='w-full relative'>
				<MediaHeader mediaProps={mediaProps} />

				<div className='px-3 sm:px-10 max-w-7xl mx-auto mt-5 pb-10'>
					<MediaCast
						cast={media?.credits?.cast}
						mediaType={media.media_type}
					/>

					<MediaCommentary
						userComment={userComment}
						setUserComment={setUserComment}
						handleClick={handleClick}
						isWatched={isWatched}
					/>

					<MediaRecommendation
						recommendation={media?.recommendations?.results}
					/>
				</div>
			</div>
		</>
	)
}
