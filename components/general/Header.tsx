'use client'

import ThemeToggle from '@/app/theme-toggle';
import Link from 'next/link';
import { useSession } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from '@/components/ui/skeleton';
import SearchDropdown from './SearchBar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from 'next-auth/react'
import { MobileMenu } from './MobileMenu';
import { useState } from 'react';
import { Search, X} from 'lucide-react' // иконка лупы
import { useTransition } from 'react'
import { usePathname } from 'next/navigation'




export default function Header() {

	const { data: session, status } = useSession() // status для отслеживания загрузки сессии
	const [showMobileInputSearch, setShowMobileInputSearch] = useState(false)
	const [mobileMenu, setMobileMenu] = useState(false) // for disable search input and mobile search icon when menu is open
	const [inputValue, setInputValue] = useState('')
	const [isOpen, setIsOpen] = useState(false) // mobile menu

	const pathname = usePathname()

    return (
		<header className='w-full dark:bg-black bg-white border-b sticky top-0 z-50'>
			<div className='mobile-header flex justify-between items-center gap-1 sm:gap-5 max-w-7xl py-3 sm:px-10 px-5 m-auto'>
				<Link
					prefetch={true}
					onClick={() => {
						setInputValue('')
						setIsOpen(false)
					}}
					href='/'
				>
					<h1 className='mobile-logo text-2xl font-semibold cursor-pointer select-none group rounded-sm hover:opacity-70 transition-all duration-300'>
						Movie
						<span className='font-bold px-1 dark:bg-white dark:text-black bg-black text-white rounded-sm transition-colors duration-300 dark:group-hover:bg-black dark:group-hover:text-white group-hover:bg-white group-hover:text-black'>
							Man
						</span>
					</h1>
				</Link>

				<div className='grow'>
					<SearchDropdown
						value={inputValue}
						onChange={setInputValue}
						mobileMenu={mobileMenu}
					/>
				</div>

				{showMobileInputSearch && (
					<SearchDropdown2
						onClose={() => setShowMobileInputSearch(false)}
					/>
				)}

				<div className='flex gap-1 sm:gap-4 justify-center items-center'>
					{status === 'loading' ? (
						<Skeleton className='w-[92px] h-[40px] md:w-[140px] md:h-[40px] rounded-lg' />
					) : (
						<>
							<button
								onClick={() => setShowMobileInputSearch(true)}
								className={`sm:hidden cursor-pointer rounded-full transition ${
									!mobileMenu
										? 'text-black dark:text-white hover:opacity-70'
										: 'text-gray-600 dark:text-gray-900 hover:opacity-100'
								}`}
								disabled={mobileMenu}
								aria-label='Search'
							>
								<Search size={24} />
							</button>
							<MobileMenu
								toggle={() => setMobileMenu(prev => !prev)}
								clearInput={() => setInputValue('')}
								isOpen={isOpen}
								setIsOpen={setIsOpen}
							/>

							<ThemeToggle />

							{session?.user ? (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Avatar className='mobile-user-icon w-9 h-9 cursor-pointer hover:opacity-75'>
											<AvatarImage
												src={
													session.user.image?.toString() ||
													'/user.jpg'
												}
												referrerPolicy='no-referrer'
											/>
											<AvatarFallback>
												{session.user.name?.charAt(0) ||
													'U'}
											</AvatarFallback>
										</Avatar>
									</DropdownMenuTrigger>

									<DropdownMenuContent
										align='end'
										className='bg-white dark:bg-black'
									>
										<DropdownMenuItem
											className='text-xl sm:text-lg font-semibold sm:font-normal cursor-pointer'
											onClick={() => alert('Профиль')}
										>
											Profile
										</DropdownMenuItem>

										<DropdownMenuItem asChild>
											<Link
												prefetch={true}
												href='/library'
												className='text-xl sm:text-lg font-semibold sm:font-normal cursor-pointer w-full'
												onClick={() => setIsOpen(false)}
											>
												My library
											</Link>
										</DropdownMenuItem>

										<DropdownMenuItem
											className='text-xl sm:text-lg font-semibold sm:font-normal cursor-pointer'
											onClick={() => signOut()}
										>
											Sign out
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							) : (
								<Link
									prefetch={true}
									href={`/login/signin?callbackUrl=${encodeURIComponent(
										pathname
									)}`}
								>
									<button
										onClick={() => setIsOpen(false)}
										className='mobile-signin grow hover:opacity-70 font-semibold cursor-pointer bg-black text-white dark:bg-white dark:text-black rounded-sm py-1 px-2'
									>
										Sign in
									</button>
								</Link>
							)}
						</>
					)}
				</div>
			</div>
		</header>
	)
}


import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface Props {
	onClose: () => void;

}

export function SearchDropdown2({ onClose }: Props) {


    const [query, setQuery] = useState('')
	const [results, setResults] = useState<any[]>([])
	const [isOpen, setIsOpen] = useState(false)
	const [highlightedIndex, setHighlightedIndex] = useState(-1)
	const listRef = useRef<HTMLUListElement | null>(null)

	const router = useRouter()

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 640) {
				setIsOpen(false)
				onClose()
			}
		}

		window.addEventListener('resize', handleResize)

		// сразу проверим на случай, если окно уже больше 640
		handleResize()

		return () => {
			window.removeEventListener('resize', handleResize)
		}
	}, [])

	// Функция для получения фильмов с TMDb
	const fetchMovies = async (query: string) => {
		try {
			const response = await axios.get(`/api/search?query=${query}`)
			setResults(response.data.results)
			console.log(response.data.results)

			setIsOpen(true)
		} catch (error) {
			console.error('Error API:', error)
		}
	}

	// Обработчик изменения текста
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setQuery(value)

		if (value.length > 0) {
			fetchMovies(value)
		} else {
			setResults([])
			setIsOpen(false)
		}
	}


	const [isPending, startTransition] = useTransition()
	

	// Обработчик выбора элемента
	const handleSelect = (item: any) => {
		setQuery(item?.title || item?.name)
		setIsOpen(false)
		onClose()
		setQuery('')
		setHighlightedIndex(-1)
		startTransition(() => {
			const pageType =
				item.media_type === 'person'
					? 'people'
					: item.media_type === 'tv'
					? 'show'
					: 'movie'

			const slug = `/${pageType}/${item.id}-${(item.title || item.name)
				.replace(/\s+/g, '-')
				.toLowerCase()}`

			router.push(slug)
		})
	}

	// Обработчик клавиш для навигации
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!isOpen) return

		if (e.key === 'ArrowDown') {
			e.preventDefault()
			setHighlightedIndex(prev =>
				prev < results.filter(item => !!item.poster_path).length - 1
					? prev + 1
					: 0
			)
		}

		if (e.key === 'ArrowUp') {
			e.preventDefault()
			setHighlightedIndex(prev =>
				prev > 0
					? prev - 1
					: results.filter(item => !!item.poster_path).length - 1
			)
		}

		if (e.key === 'Enter' && highlightedIndex >= 0) {
			e.preventDefault()
			handleSelect(
				results.filter(item => !!item.poster_path)[highlightedIndex]
			)
		}

		if (e.key === 'Escape') {
			setIsOpen(false)
		}
	}

	// Обработчик клика вне поля поиска
	const handleClickOutside = (e: MouseEvent) => {
		if (!e.target || !(e.target instanceof HTMLElement)) return
		if (!e.target.closest('.search-dropdown')) {
			setIsOpen(false)
			onClose();
		}
	}

	// Прокручиваем список при изменении highlightedIndex
	useEffect(() => {
		if (listRef.current && highlightedIndex !== -1) {
			const listItem = listRef.current.children[
				highlightedIndex
			] as HTMLElement
			if (listItem) {
				listItem.scrollIntoView({
					block: 'nearest', // Прокрутка в область видимости
					behavior: 'smooth',
				})
			}
		}
	}, [highlightedIndex])

	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])


	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}
		document.addEventListener('keydown', handleEscape)
		return () => document.removeEventListener('keydown', handleEscape)
	}, [onClose])

	return (
		<>
			{isPending && (
				<div className='fixed inset-0 z-100 bg-black flex items-center justify-center'>
					<span className='text-white text-xl animate-pulse'>
						Loading...
					</span>
				</div>
			)}

			<motion.div
				initial={{ scaleX: 0, opacity: 0 }}
				animate={{ scaleX: 1, opacity: 1 }}
				exit={{ scaleX: 0, opacity: 0 }}
				transition={{ duration: 0.3 }}
				className='absolute left-0 top-0 w-full h-16 bg-white dark:bg-black z-52 origin-center px-2 flex items-center justify-between search-dropdown'
			>
				<input
					type='text'
					placeholder='Search movie, tv show or person...'
					value={query}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					className='w-full h-10 px-2 border rounded-sm bg-white dark:bg-black text-black dark:text-white outline-none'
				/>
				<button
					onClick={() =>
						query.length > 0
							? (setQuery(''), setIsOpen(false))
							: onClose()
					}
					className='absolute right-5 text-sm text-gray-500 cursor-pointer hover:opacity-70'
				>
					<X size={24} />
				</button>
				{isOpen && results.length > 0 && (
					<ul
						ref={listRef}
						className='absolute left-0 top-15 w-full z-10 bg-white dark:bg-black mt-1 shadow max-h-[50dvh] overflow-auto'
					>
						{results
							.filter(item => !!item.poster_path) // Убираем все без постера
							.map((item, index) => (
								<li
									key={item.id}
									onClick={() => handleSelect(item)}
									onMouseEnter={() =>
										setHighlightedIndex(index)
									}
									className={`p-2 cursor-pointer border-b ${
										highlightedIndex === index
											? 'bg-gray-100 dark:text-black'
											: 'hover:bg-gray-100 dark:hover:text-black'
									}`}
								>
									<div className='flex items-center'>
										<img
											src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
											alt={item.title || item.name}
											className='rounded shadow-lg h-15'
										/>
										<div className='flex flex-col ml-4'>
											<h3 className='font-semibold text-xl'>
												{item.title || item.name}
											</h3>
											<p className='text-xs text-gray-500'>
												{item.media_type !==
												'person' ? (
													<>
														{item.media_type ===
														'tv'
															? 'TV Show'
															: 'Movie'}

														{item?.release_date && (
															<>
																{' | '}
																{
																	item.release_date.split(
																		'-'
																	)[0]
																}
															</>
														)}

														{item?.runtime !== 0 &&
															item?.runtime !==
																null && (
																<>
																	{' | '}
																	{
																		item.runtime
																	}{' '}
																	min
																</>
															)}
													</>
												) : (
													<>
														{
															item?.known_for_department
														}
														{item?.known_for
															?.length && (
															<>
																{' | '}
																{item.known_for
																	.map(
																		(actor: {
																			title: string
																			name: string
																		}) =>
																			actor.title ||
																			actor.name
																	)
																	.join(', ')}
															</>
														)}
													</>
												)}
											</p>

											<p className='text-sm text-gray-500'>
												{item?.cast?.length
													? item.cast
															.map(
																(actor: {
																	name: string
																}) =>
																	actor?.name
															)
															.join(', ')
													: ''}
											</p>
										</div>
									</div>
								</li>
							))}
						
					</ul>
				)}
			</motion.div>
		</>
	)
}