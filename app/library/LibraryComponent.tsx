'use client'

import useSWR from 'swr'
import { mutate } from 'swr'

import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'
import ListMenuBlock from '@/components/general/ListMenuBlock'
import { UserMedia } from '@prisma/client'
import { formatDate } from 'lib/formatDate'
import { usePathname } from 'next/navigation'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { ArrowDownAZ, ArrowUpZA } from 'lucide-react'
import { filterMediaByTab, sortMedia } from './libraryUtils'
import DeleteListDialog from './DeleteListDialog'
import EditListDialog from './EditListDialog'
import { toast } from 'sonner'
import { Share2 } from 'lucide-react'
import { Session } from 'next-auth'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function MyLibrary({session}: {session: Session | null}) {
	const [activeTab, setActiveTab] = useState('watched')
	const [mediaType, setMediaType] = useState('movie')
	const pathname = usePathname()

	const [sortOption, setSortOption] = useState<string>('name')
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')


	const [selectedListId, setSelectedListId] = useState('') // id of selected list to show media
	const [selectedListName, setSelectedListName] = useState('') // name of selected list to show media
	const [isLoadingList, setIsLoadingList] = useState(false)

	// data from usermedia
	const {
		data: commonData,
		error,
		isLoading,
	} = useSWR(`/api/db`, fetcher, {
		revalidateOnFocus: true,
	})

	// function to get lists of user
	const {
		data: userLists,
		error: userListsError,
		isLoading: userListsLoading,
	} = useSWR(`/api/lists/get?userId=${session?.user.id}`, fetcher, {
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
		await mutate(
			`/api/lists/get-media?userId=${session?.user.id}&listId=${selectedListId}`
		)
		await mutate(`/api/lists/count`)
	}


	const handleListCreated = async () => {
		await mutate(`/api/db`)
		await mutate(`/api/lists/get?userId=${session?.user.id}`)
		await mutate(
			`/api/lists/get-media?userId=${session?.user.id}&listId=${selectedListId}`
		)
		await mutate(`/api/lists/count`)
	}

	// function to get media from list
	const {
		data: userListsMedia,
		error: userListsMediaError,
		isLoading: userListsMediaLoading,
	} = useSWR(
		!!session?.user.id && !!selectedListId
			? `/api/lists/get-media?userId=${session?.user.id}&listId=${selectedListId}`
			: null,
		fetcher,
		{
			revalidateOnFocus: true,
		}
	)

	const handleListDelete = async (listId: string) => {
		if (selectedListId !== '') {
			setIsLoadingList(true)
			const res = await fetch(`/api/lists/delete?listId=${listId}`, {
				method: 'DELETE',
			})
			if (!res.ok) throw new Error('Ошибка при удалении списка')
			setActiveTab('watched')
			setSelectedListId('')
			setSelectedListName('')
			await mutate(`/api/db`)
			await mutate(`/api/lists/get?userId=${session?.user.id}`)
			await mutate(
				`/api/lists/get-media?userId=${session?.user.id}&listId=${selectedListId}`
			)
			await mutate(`/api/lists/count`)
			setIsLoadingList(false)
		}
	}

	const handleListRename = async (name: string) => {
    if (!name.trim()) return 
    setIsLoadingList(true)

    try {
		const res = await fetch(`/api/lists/rename?id=${selectedListId}&name=${encodeURIComponent(name)}`, {
			method: 'PATCH',
		})

		const data = await res.json()

		if (!res.ok) {
			toast(data.error || 'Error renaming list')
		} else {
			toast('List renamed successfully')
			await mutate(`/api/lists/get?userId=${session?.user.id}`)
			setSelectedListName(name)
		}
		} catch (err) {
			console.log('Invalid request', err)
		} finally {
			setIsLoadingList(false)
		}
	}



	function getData() {
		const source = activeTab === '' ? userListsMedia : commonData

		if (Array.isArray(source)) {
			return filterMediaByTab(source, mediaType, activeTab)
		}
		return []
	}

	useEffect(() => {
		activeTab !== '' && setSelectedListId('')
	}, [activeTab])

	// function to handle selected list and fetch media
	const handleSelectChange = async (listId: string) => {
		if (session) {
			await mutate(`/api/db`)
			await mutate(`/api/lists/get?userId=${session?.user.id}`)
			await mutate(
				`/api/lists/get-media?userId=${session?.user.id}&listId=${selectedListId}`
			)			
			await mutate(`/api/lists/count`)
		}
		setActiveTab('')
		setSelectedListId(listId)
		const selected = userLists.find((list: any) => list.id === listId)
		if (selected) {
			setSelectedListName(selected.name)
		}
	}
	function getCount() {
		const filteredCommon = (commonData || []).filter(
			(obj: any) => obj.isWatched || obj.isWishlist || obj.isFavorite
		)

		return filteredCommon.length === 0
			? ''
			: `(${filteredCommon.length} ${
					filteredCommon.length === 1 ? 'item' : 'items'
			})`
	}


	const handleCopy = async () => {
		if (!session?.user.id) return
		const list = selectedListId || activeTab 
		const shareUrl = `${window.location.origin}/sharelist?userId=${session.user.id}&listId=${list}`
		await navigator.clipboard.writeText(shareUrl)
		toast.success('Link copied!')

	}

	if (
		isLoading ||
		isLoadingList ||
		userListsMediaLoading ||
		userListsLoading
	)
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
					{getCount()}
				</span>
			</h1>

			<div className='flex gap-2 items-baseline flex-wrap'>
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className='p-0 rounded-sm h-auto gap-3 bg-transparent flex-wrap items-center'>
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

				{userLists.length > 0 && (
					<Select
						value={selectedListId}
						onValueChange={handleSelectChange}
					>
						<SelectTrigger
							className={
								selectedListId
									? 'bg-black text-white dark:bg-white dark:text-black cursor-pointer font-semibold'
									: 'cursor-pointer'
							}
						>
							<SelectValue placeholder='My lists' />
						</SelectTrigger>
						<SelectContent>
							{userLists.map((listItem: any) => (
								<SelectItem
									key={listItem.id}
									value={listItem.id}
									className='cursor-pointer'
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
						className='cursor-pointer hover:opacity-70 px-2 py-1 rounded-sm data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-sm dark:data-[state=active]:bg-white dark:data-[state=active]:text-black border-black dark:border-white'
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
			{!commonData ||
				(commonData.length === 0 && (
					<div className='w-full min-h-[50vh] flex justify-center items-center'>
						<p>List is empty..</p>
					</div>
				))}
			{!error && commonData && commonData.length !== 0 && (
				<>
					<div className='flex gap-2 mt-5 items-center'>
						<h2 className='text-2xl sm:text-3xl font-semibold'>
							{activeTab === 'watched'
								? 'My watched list'
								: activeTab === 'wishlist'
								? 'My wishlist'
								: activeTab === 'favorite'
								? 'My favorite list'
								: selectedListName}
						</h2>
						{/* <EditIcon className='w-6 h-6 text-red-500 cursor-pointer' /> */}
						<Share2
							onClick={handleCopy}
							className='w-6 h-6 text-black dark:text-white cursor-pointer'
						/>
						{activeTab === '' && (
							<div className='flex gap-2'>
								{/* <Link
									prefetch={true}
									className='flex-shrink-0 hover:opacity-70'
									href={`/sharelist?userId=${session.user.id}&listId=${selectedListId}`}
								>
									<Share2 className='w-6 h-6 text-black dark:text-white cursor-pointer' />
								</Link> */}

								<EditListDialog
									currentName={selectedListName}
									onSave={handleListRename}
								/>
								<DeleteListDialog
									selectedListName={selectedListName}
									selectedListId={selectedListId}
									handleListDelete={handleListDelete}
								/>
							</div>
						)}
					</div>

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
											prefetch={true}
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

										<p className='text-gray-400 text-sm'>
											{item.type === 'tv'
												? 'TV Series'
												: 'Movie'}
										</p>
										{item.poster && (
											<Link
												prefetch={true}
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
										setIsFavorite={() => {
											updateMovie({
												...item,
												isFavorite: !item.isFavorite,
											})
										}}
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
		<div className='mobile-header h-full m-auto max-w-7xl py-3 sm:px-10 px-5 flex flex-col gap-2 justify-center items-center'>
			Log in your account!
			<Link
				prefetch={true}
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
