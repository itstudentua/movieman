// app/user-lists/page.tsx
'use client'

import useSWR from 'swr'
import { mutate } from 'swr'

import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'
import ListMenuBlock from '@/components/general/ListMenuBlock'
import { UserMedia } from '@prisma/client'
import {formatDate} from 'lib/formatDate'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'


const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function MyLibrary() {
	const [activeTab, setActiveTab] = useState('watched')
	const [mediaType, setMediaType] = useState('movie')
	const { data: session } = useSession() // status для отслеживания загрузки сессии
	const pathname = usePathname()

	const [isLogin, setIsLogin] = useState(true)

	
	
	const { data, error, isLoading } = useSWR(
		`/api/library?type=${activeTab}`,
		fetcher,
		{ 
			revalidateOnFocus: true,
		}
	)
	
	async function updateMovie(update: Partial<UserMedia>) {
		await fetch('/api/db', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(update),
		})

		await mutate(`/api/library?type=${activeTab}`)
	}

	useEffect(() => {
		session?.user.id && setIsLogin(false)
	}, [session?.user.id])

	setTimeout(() => {
		setIsLogin(false) // чтобы вырубалось если юзер не вошел в аккаунт
	}, 300)

	if (isLoading || isLogin)
		return (
			<div className='fixed inset-0 z-100 bg-black flex items-center justify-center'>
				<span className='text-white text-xl animate-pulse'>
					Loading...
				</span>
			</div>
		)

	return session?.user.id ? (
		<div className='mobile-header m-auto max-w-7xl py-3 sm:px-10 px-5'>
			<h1 className='text-4xl font-bold mb-4'>
				My library
			</h1>
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
					<h1 className='mt-10 text-2xl font-semibold'>
						{activeTab === 'watched'
							? 'My watched list'
							: activeTab === 'wishlist'
							? 'My wishlist'
							: activeTab === 'favorite'
							? 'My favorite list'
							: 'Custom list'}
					</h1>
					<p className='text-gray-500 text-xl mt-3'>
						{
							data.filter((obj: any) => obj.type === mediaType)
								.length
						}{' '}
						{data.filter((obj: any) => obj.type === mediaType)
							.length > 1
							? 'items'
							: 'item'}
					</p>
					<div className='mt-10 flex flex-col gap-5'>
						{data
							.filter((obj: any) => obj.type === mediaType)
							.map((item: any) => (
								<div
									key={item.id}
									className='w-full flex gap-5 border-b pb-5 rounded items-center'
								>
									{item.poster && (
										<Link
											className='flex-shrink-0 hover:opacity-70'
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
										<p className='border-b-2 w-fit'>
											Global Rating:{' '}
											{item.rating?.toFixed(1)} ⭐️
										</p>
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
										isWatched={item.isWatched}
										isFavorite={item.isFavorite}
										isWishlist={item.isWishlist}
										setIsWatched={() =>
											updateMovie({
												...item,
												isWatched: !item.isWatched,
											})
										}
										setIsFavorite={() =>
											updateMovie({
												...item,
												isFavorite: !item.isFavorite,
											})
										}
										setIsWishlist={() =>
											updateMovie({
												...item,
												isWishlist: !item.isWishlist,
											})
										}
									/>
								</div>
							))}
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
