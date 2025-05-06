// app/user-lists/page.tsx
'use client'

import useSWR from 'swr'
import { mutate } from 'swr'

import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'
import ListMenuBlock from '@/components/general/ListMenuBlock'
import { UserMedia } from '@prisma/client'
import { formatDate } from 'lib/formatDate'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { ArrowDownAZ, ArrowUpZA } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function MyLibrary() {
	const [activeTab, setActiveTab] = useState('watched')
	const [mediaType, setMediaType] = useState('movie')
	const { data: session } = useSession()
	const pathname = usePathname()

	const [sortOption, setSortOption] = useState<string>('name')
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

	const [lists, setLists] = useState([]) // user lists array
	const [listData, setListData] = useState([]) // list media (movies, tv shows)
	const [selectedListId, setSelectedListId] = useState('') // id of selected list to show media
	const [selectedListName, setSelectedListName] = useState('') // name of selected list to show media
	const [count, setCount] = useState(0) 
	const [isLoadingList, setIsLoadingList] = useState(false)

	function filterMediaByTab(
		data: any[],
		mediaType: string,
		activeTab: string
	) {
		return data.filter(obj => {
			if (obj.type !== mediaType) return false

			switch (activeTab) {
				case 'wishlist':
					return obj.isWishlist
				case 'watched':
					return obj.isWatched
				case 'favorite':
					return obj.isFavorite
				default:
					return true
			}
		})
	}

	function sortMedia(
		media: any[],
		sortOption: string,
		sortOrder: 'asc' | 'desc'
	) {
		const sorted = [...media].sort((a, b) => {
			let valA, valB

			switch (sortOption) {
				case 'name':
					valA = a.title || ''
					valB = b.title || ''
					return valA.localeCompare(valB)
				case 'release_date':
					return (a.year ?? 0) - (b.year ?? 0)
				case 'watched_date':
					return (
						new Date(a.watchedDate ?? 0).getTime() -
						new Date(b.watchedDate ?? 0).getTime()
					)
				case 'global_rating':
					return (a.rating ?? 0) - (b.rating ?? 0)
				case 'user_rating':
					return (a.userRating ?? 0) - (b.userRating ?? 0)
				default:
					return 0
			}
		})

		return sortOrder === 'asc' ? sorted : sorted.reverse()
	}

	const { data, error, isLoading } = useSWR(`/api/db`, fetcher, {
		revalidateOnFocus: true,
	})

	async function updateMovie(update: Partial<UserMedia>) {
		await fetch('/api/db', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(update),
		})

		await mutate(`/api/db`)
		await mutate(`/api/lists/get?userId=${session?.user.id}`)
		selectedListId !== '' && await mutate(`/api/lists/get-media?userId=${session?.user.id}&listId=${selectedListId}`)
		await mutate(`/api/lists/count`)
		await mutate(`/api/db`)	
		
	}

	// function to get lists of user
	const fetchUserLists = async (userId: string) => {
		setIsLoadingList(true)
		const res = await fetch(`/api/lists/get?userId=${userId}`)

		if (!res.ok) {
			throw new Error('Ошибка при получении списков')
		}
		const listData = await res.json()
		setLists(listData)
		setIsLoadingList(false)
	}

	useEffect(() => {
		if (!session?.user?.id) return
		fetchUserLists(session.user.id)
		countOfMedia()
	}, [session])

	const handleListCreated = async () => {
		
		if (session?.user.id) {
			activeTab === '' && fetchMedia(session.user.id, selectedListId)
			countOfMedia()
			fetchUserLists(session.user.id)
		}
	}

	// function to get media from list
	const fetchMedia = async (userId: string, listId: string) => {
		setIsLoadingList(true)
		setActiveTab('')
		const res = await fetch(
			`/api/lists/get-media?userId=${userId}&listId=${listId}`
		)
		if (!res.ok) throw new Error('Ошибка при загрузке медиа')
		const listMediaData = await res.json()
		setListData(listMediaData)
		setIsLoadingList(false)
	}

	async function countOfMedia() {
		setIsLoadingList(true)
		const res = await fetch('/api/lists/count')
		const data = await res.json()
		setCount(data.count)
		setIsLoadingList(false)
	}

	const handleListDelete = async (listId: string) => {
		if (selectedListId !== '') {
			setIsLoadingList(true)
			const res = await fetch(`/api/lists/delete?listId=${listId}`, {
				method: 'DELETE',
			})
			if (!res.ok) throw new Error('Ошибка при удалении списка')
			const data = await res.json()
			setLists(data)
			setSelectedListId('')
			setSelectedListName('')
			setIsLoadingList(false)
		}
	}

	function getData() {
		const source = activeTab === '' ? listData : data
		console.log(filterMediaByTab(source, mediaType, activeTab))

		return filterMediaByTab(source, mediaType, activeTab)
	}

	useEffect(() => {
		activeTab !== '' && setSelectedListId('')
	}, [activeTab])


	// function to handle selected list and fetch media
	const handleSelectChange = (listId: string) => {
		if (session) {
			fetchMedia(session.user.id, listId)
		}
		setSelectedListId(listId)
		const selected = lists.find((list: any) => list.id === listId)
		if (selected) {
			setSelectedListName(selected.name)
		}
	}

	if (isLoading || isLoadingList)
		return (
			<div className='fixed inset-0 z-100 bg-black flex items-center justify-center'>
				<span className='text-white text-xl animate-pulse'>
					Loading...
				</span>
			</div>
		) 

	return session?.user.id ? (
		<div className='mobile-header m-auto max-w-7xl py-3 sm:px-10 px-5'>
			<h1 className='text-2xl sm:text-4xl font-bold mb-4'>
				My library{' '}
				<span className='font-semibold text-gray-400 text-xl'>
					(
					{data.filter(
						(obj: any) =>
							obj.isWatched || obj.isWishlist || obj.isFavorite
					) > 1
						? `${
								data.filter(
									(obj: any) =>
										obj.isWatched ||
										obj.isWishlist ||
										obj.isFavorite
								).length
						  } items`
						: `${
								data.filter(
									(obj: any) =>
										obj.isWatched ||
										obj.isWishlist ||
										obj.isFavorite
								).length
						  } item`}
					)
				</span>
				{count}
			</h1>

			<div className='flex gap-2 items-baseline flex-wrap'>
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className='p-0 rounded-sm h-auto gap-3 bg-transparent'>
						<TabsTrigger
							className='cursor-pointer hover:opacity-70 px-2 py-1 rounded-sm data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-sm dark:data-[state=active]:bg-white dark:data-[state=active]:text-black border-black dark:border-white'
							value='watched'
						>
							Watched
						</TabsTrigger>
						<TabsTrigger
							className='cursor-pointer hover:opacity-70 px-2 py-1 rounded-sm data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-sm dark:data-[state=active]:bg-white dark:data-[state=active]:text-black border-black dark:border-white'
							value='wishlist'
						>
							WishList
						</TabsTrigger>
						<TabsTrigger
							className='cursor-pointer hover:opacity-70 px-2 py-1 rounded-sm data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-sm dark:data-[state=active]:bg-white dark:data-[state=active]:text-black border-black dark:border-white'
							value='favorite'
						>
							Favorite
						</TabsTrigger>
					</TabsList>
					<TabsContent value='watched' />
					<TabsContent value='wishlist' />
					<TabsContent value='favorite' />
				</Tabs>

				{lists.length > 0 && (
					<Select
						value={selectedListId}
						onValueChange={handleSelectChange}
					>
						<SelectTrigger className='w-fit'>
							<SelectValue placeholder='My lists' />
						</SelectTrigger>
						<SelectContent>
							{lists.map((listItem: any) => (
								<SelectItem
									key={listItem.id}
									value={listItem.id}
									onSelect={() => alert()}
								>
									{listItem.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}
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
						className='cursor-pointer hover:opacity-70 px-2 py-1 rounded-sm data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-sm dark:data-[state=active]:bg-white dark:data-[state=active]:text-black border-black dark:border-white border-1'
						value='tv'
					>
						TV Series
					</TabsTrigger>
				</TabsList>
				<TabsContent value='movie' />
				<TabsContent value='tv' />
			</Tabs>

			{error && (
				<div className='w-full min-h-[50vh] flex justify-center items-center'>
					<p>Error!</p>
				</div>
			)}
			{!data ||
				(data.length === 0 && (
					<div className='w-full min-h-[50vh] flex justify-center items-center'>
						<p>List is empty..</p>
					</div>
				))}
			{!error && data && data.length !== 0 && (
				<>
					<h2 className='mt-5 text-2xl sm:text-3xl font-semibold'>
						{activeTab === 'watched'
							? 'My watched list'
							: activeTab === 'wishlist'
							? 'My wishlist'
							: activeTab === 'favorite'
							? 'My favorite list'
							: selectedListName}
						<span onClick={() => handleListDelete(selectedListId)}>
							{' '}
							delete
						</span>
					</h2>
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
									value='watched_date'
								>
									Watched date
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
									My rating
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
					<div className='mt-10 flex flex-col gap-5'>
						{sortMedia(getData(), sortOption, sortOrder).map(
							(item: any) => (
								<div
									key={item.id}
									className='w-full flex gap-5 border-b pb-5 rounded items-center flex-wrap sm:flex-nowrap'
								>
									{item.poster && (
										<Link
											className='flex-shrink-0 hover:opacity-70 hidden sm:block'
											href={`/${
												item.type === 'tv'
													? 'show'
													: 'movie'
											}/${item.mediaId}`}
										>
											<img
												src={`https://image.tmdb.org/t/p/w500${item.poster}`}
												alt={item.title}
												className='h-40 rounded-xl'
											/>
										</Link>
									)}
									<div className='flex flex-col justify-center grow'>
										<h2 className='text-xl font-semibold'>
											<Link
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

										<p className='text-gray-400 text-sm'>
											{item.type === 'tv'
												? 'TV Series'
												: 'Movie'}
										</p>
										{item.poster && (
											<Link
												className='flex-shrink-0 hover:opacity-70 block sm:hidden'
												href={`/${
													item.type === 'tv'
														? 'show'
														: 'movie'
												}/${item.mediaId}`}
											>
												<img
													src={`https://image.tmdb.org/t/p/w500${item.poster}`}
													alt={item.title}
													className='h-40 rounded-xl'
												/>
											</Link>
										)}
										{item?.rating !== 0 && (
											<p className='border-b-2 w-fit'>
												Global Rating:{' '}
												{item.rating?.toFixed(1)} ⭐️
											</p>
										)}
										{item.userRating && (
											<p>
												My Rating: {item.userRating} ⭐️
											</p>
										)}
										{item.watchedDate && (
											<p>
												Watched date:{' '}
												{formatDate(item.watchedDate)}
											</p>
										)}
										<p className='mt-3 line-clamp-2'>
											{item.userComment ||
												item.description}
										</p>
									</div>
									<ListMenuBlock
										handleListCreated={handleListCreated}
										mediaId={item.mediaId}
										watchedButton={true}
										isWatched={item.isWatched}
										isFavorite={item.isFavorite}
										isWishlist={item.isWishlist}
										setIsWatched={() =>
											updateMovie({
												...item,
												isWatched: !item.isWatched,
											})
										}
										setIsFavorite={() =>{
											updateMovie({
												...item,
												isFavorite: !item.isFavorite,
											})}
										}
										setIsWishlist={() =>
											updateMovie({
												...item,
												isWishlist: !item.isWishlist,
											})
										}
									/>
								</div>
							)
						)}
					</div>
				</>
			)}
		</div>
	) : (
		<div className='mobile-header h-full m-auto max-w-7xl py-3 sm:px-10 px-5 border-red-600 border-2 flex flex-col gap-2 justify-center items-center'>
			Log in your account!
			<Link
				href={`/login/signin?callbackUrl=${encodeURIComponent(
					pathname
				)}`}
			>
				<button className='mobile-signin grow hover:opacity-70 font-semibold cursor-pointer bg-black text-white dark:bg-white dark:text-black rounded-sm py-1 px-2'>
					Login
				</button>
			</Link>
		</div>
	)
}
