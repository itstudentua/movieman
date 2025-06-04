'use client'

import useSWR from 'swr'
import { mutate } from 'swr'

import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'
import ListMenuBlock from '@/components/general/ListMenuBlock'
import { UserMedia } from '@prisma/client'
import { useSession } from 'next-auth/react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { ArrowDownAZ, ArrowUpZA } from 'lucide-react'
import { sortMedia, filterMediaByTab } from '../library/libraryUtils'
import { useSearchParams } from 'next/navigation'
import { CommonMedia } from '@/lib/movieTypes'
import Image from 'next/image'
import LoadingPage from '@/components/general/Loader'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ShareListComponent() {
	const [mediaType, setMediaType] = useState('movie')
	const searchParams = useSearchParams()

	const userId = searchParams.get('userId')
	const listId = searchParams.get('listId')

	const [sortOption, setSortOption] = useState<string>('name')
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
	const { data: session } = useSession()
	const [userName, setUserName] = useState('')
	const [isLoadingUser, setIsLoadingUser] = useState(false)

	useEffect(() => {
		const fetchUser = async () => {
			if (!userId) {
				return
			}
			setIsLoadingUser(true)
			const res = await fetch(`/api/get-user?id=${userId}`)
			const data = await res.json()
			setUserName(data.name)
			setIsLoadingUser(false)
		}

		fetchUser()
	}, [userId])

	// function to get media from list
	const { data: shareListData, isLoading: isLoadingList } = useSWR(
		listId !== 'watched' && listId !== 'favorite' && listId !== 'wishlist'
			? `/api/lists/get-media?userId=${userId}&listId=${listId}`
			: `/api/db?userId=${userId}&listType=${listId}`,
		fetcher,
		{
			revalidateOnFocus: true,
		}
	)

	const {
		data: getUserLists,
		isLoading: isLoadingUserList,
	} = useSWR(`/api/lists/get?userId=${userId}`, fetcher, {
		revalidateOnFocus: true,
	})

	const {
		data: userData,
		isLoading,
	} = useSWR(`/api/db`, fetcher, {
		revalidateOnFocus: true,
	})

	// медиа со списка
	function getData() {
		const source = shareListData

		if (Array.isArray(source)) {
			return filterMediaByTab(source, mediaType, '')
		}
		return []
	}

	// медиа юзера, который авторизован
	function getUserData(item: CommonMedia) {
		if (!userData) return null
		const res = userData.find(
			(userItem: CommonMedia) => userItem.mediaId === item.mediaId
		)
		return res
	}

	async function updateMovie(update: Partial<UserMedia>) {
		await fetch('/api/db', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(update),
		})

		await mutate(`/api/db`)
		await mutate(`/api/lists/get-media?userId=${userId}&listId=${listId}`)
	}

	const handleListRemove = async () => {
		await mutate(`/api/db`)
		await mutate(`/api/lists/get?userId=${userId}`)
		await mutate(`/api/lists/get-media?userId=${userId}&listId=${listId}`)
	}


	if (!userId || !listId) {
		return <p>Not found</p>
	}

	if (isLoadingList || isLoadingUserList || isLoading || isLoadingUser)
		return (
			<LoadingPage />
		)

	return (
		<div className='mobile-header m-auto max-w-7xl py-3 sm:px-10 px-5'>
			{!shareListData ||
				(shareListData.length === 0 && (
					<div className='w-full min-h-[50vh] flex justify-center items-center'>
						<p>List is empty..</p>
					</div>
				))}
			{shareListData && shareListData.length !== 0 && (
				<>
					<div className='flex flex-col gap-2 mt-1'>
						<p className='text-xl sm:text-2xl font-semibold text-gray-300'>
							{`${userName}'s`}{' '}
							{(listId === 'watched' ||
								listId === 'favorite' ||
								listId === 'wishlist') &&
								listId}{' '}
							{'  '}
							list
						</p>
						<h2 className='text-2xl sm:text-3xl font-semibold'>
							{getUserLists &&
								getUserLists.find(
									(list: { id: number }) =>
										String(list.id) === listId
								)?.name}
							<span className='font-semibold text-gray-400 text-xl'>
								{shareListData.length === 1
									? ` (${shareListData.length} item)`
									: shareListData.length > 1
									? ` (${shareListData.length} items)`
									: null}
							</span>
						</h2>
					</div>

					<Tabs
						className='mt-3'
						value={mediaType}
						onValueChange={setMediaType}
					>
						<TabsList className='p-0 rounded-sm h-auto gap-2 bg-transparent'>
							<TabsTrigger
								className='cursor-pointer hover:opacity-70 px-2 py-1 rounded-sm data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-sm dark:data-[state=active]:bg-white dark:data-[state=active]:text-black border-black dark:border-white'
								value='movie'
							>
								Movie
							</TabsTrigger>
							<TabsTrigger
								className='cursor-pointer hover:opacity-70 px-2 py-1 rounded-sm data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-sm dark:data-[state=active]:bg-white dark:data-[state=active]:text-black border-black dark:border-white'
								value='tv'
							>
								TV Series
							</TabsTrigger>
						</TabsList>
						<TabsContent value='movie' />
						<TabsContent value='tv' />
					</Tabs>

					<div className='flex gap-2 items-center mt-3'>
						<label className='text-xl'>Sort by</label>

						<Select
							defaultValue='name'
							onValueChange={value => setSortOption(value)}
						>
							<SelectTrigger className='w-fit cursor-pointer'>
								<SelectValue placeholder='Sort by' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem
									className='cursor-pointer'
									value='name'
								>
									Name
								</SelectItem>
								<SelectItem
									className='cursor-pointer'
									value='release_date'
								>
									Release date
								</SelectItem>

								<SelectItem
									className='cursor-pointer'
									value='global_rating'
								>
									Global rating
								</SelectItem>
								<SelectItem
									className='cursor-pointer'
									value='user_rating'
								>
									List owner rating
								</SelectItem>
							</SelectContent>
						</Select>
						<button
							onClick={() =>
								setSortOrder(prev =>
									prev === 'asc' ? 'desc' : 'asc'
								)
							}
							className='p-2 rounded-md hover:bg-muted transition-colors cursor-pointer'
							title={`Sort ${
								sortOrder === 'asc' ? 'descending' : 'ascending'
							}`}
						>
							{sortOrder === 'asc' ? (
								<ArrowDownAZ size={18} />
							) : (
								<ArrowUpZA size={18} />
							)}
						</button>
					</div>
					<p className='text-gray-500 text-xl mt-3'>
						{getData().length}{' '}
						{getData().length > 1 ? 'items' : 'item'}
					</p>
					<div className='mt-5 flex flex-col gap-5'>
						{sortMedia(getData(), sortOption, sortOrder).map(
							(item: CommonMedia) => (
								<div
									key={item.id}
									className='w-full flex gap-5 border-b pb-5 rounded items-center flex-wrap sm:flex-nowrap'
								>
									{item.poster && (
										<Link
											prefetch={true}
											className='flex-shrink-0 hover:opacity-70 hidden sm:block'
											href={`/${
												item.type === 'tv'
													? 'show'
													: 'movie'
											}/${item.mediaId}`}
										>
											{/* <img
												src={`https://image.tmdb.org/t/p/w500${item.poster}`}
												alt={item.title}
												className='h-40 rounded-xl'
											/> */}
											<Image
												src={`https://image.tmdb.org/t/p/w500${item.poster}`}
												alt={item.title as string}
												height={160}
												width={195}
												className='rounded-lg'
											/>
										</Link>
									)}
									<div className='flex flex-col justify-center grow'>
										<h2 className='text-xl font-semibold'>
											<Link
												prefetch={true}
												className='flex-shrink-0 hover:opacity-70'
												href={`/${
													item.type === 'tv'
														? 'show'
														: 'movie'
												}/${item.mediaId}`}
											>
												<span>{item.title} </span>
											</Link>
											<span className='text-sm text-gray-500'>
												{item.year}
											</span>
										</h2>

										<p className='mt-1 text-gray-400 text-sm'>
											{item.type === 'tv'
												? 'TV Series'
												: 'Movie'}
										</p>
										{item.poster && (
											<Link
												prefetch={true}
												className='mt-1 flex-shrink-0 hover:opacity-70 block sm:hidden'
												href={`/${
													item.type === 'tv'
														? 'show'
														: 'movie'
												}/${item.mediaId}`}
											>
												{/* <img
													src={`https://image.tmdb.org/t/p/w500${item.poster}`}
													alt={item.title}
													className='h-40 rounded-xl'
												/> */}
												<Image
													src={`https://image.tmdb.org/t/p/w500${item.poster}`}
													alt={item.title as string}
													height={160}
													width={195}
													className='rounded-lg'
												/>
											</Link>
										)}
										{item?.rating !== 0 && (
											<p className='mt-2 border-b-2 w-fit'>
												Global Rating:{' '}
												{item.rating?.toFixed(1)} ⭐️
											</p>
										)}
										{item.userRating && (
											<p>
												{`${userName}'s Rating:`}{' '}
												{item.userRating} ⭐️
											</p>
										)}

										<p className='mt-3 line-clamp-2'>
											{item.userComment ||
												item.description}
										</p>
									</div>
									{session?.user && (
										<ListMenuBlock
											handleListCreated={handleListRemove}
											mediaId={item.mediaId}
											watchedButton={true}
											isWatched={
												getUserData(item)?.isWatched ||
												false
											}
											isFavorite={
												getUserData(item)?.isFavorite ||
												false
											}
											isWishlist={
												getUserData(item)?.isWishlist ||
												false
											}
											setIsWatched={() => {
												let userData = getUserData(item)
												if (!userData)
													userData = {
														...item,
														userComment: null,
														userId: session?.user
															?.id,
														userRating: null,
														watchedDate: null,
														isFavorite: false,
														isWishlist: false,
														isWatched: false,
													}

												updateMovie({
													...userData,
													isWatched:
														!userData.isWatched,
												})
											}}
											setIsFavorite={() => {
												let userData = getUserData(item)
												if (!userData)
													userData = {
														...item,
														userComment: null,
														userId: session.user.id,
														userRating: null,
														watchedDate: null,
														isFavorite: false,
														isWishlist: false,
														isWatched: false,
													}

												updateMovie({
													...userData,
													isFavorite:
														!userData.isFavorite,
												})
											}}
											setIsWishlist={() => {
												let userData = getUserData(item)
												if (!userData)
													userData = {
														...item,
														userComment: null,
														userId: session.user.id,
														userRating: null,
														watchedDate: null,
														isFavorite: false,
														isWishlist: false,
														isWatched: false,
													}
												updateMovie({
													...userData,
													isWishlist:
														!userData.isWishlist,
												})
											}}
										/>
									)}
								</div>
							)
						)}
					</div>
				</>
			)}
		</div>
	)
}
