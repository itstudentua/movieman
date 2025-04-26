import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { useTransition } from 'react'

interface Props {
	mobileMenu: boolean
	value: string
	onChange: (value: string) => void
}

const SearchDropdown = ({ mobileMenu, value, onChange }: Props) => {
	// const [query, setQuery] = useState('')
	const [results, setResults] = useState<any[]>([])
	const [isOpen, setIsOpen] = useState(false)
	const [highlightedIndex, setHighlightedIndex] = useState(-1)
	const listRef = useRef<HTMLUListElement | null>(null)

	const router = useRouter()

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 640) {
				setIsOpen(false)
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
			console.error('Ошибка при получении данных с API:', error)
		}
	}

	// Обработчик изменения текста
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		onChange(value)

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
		onChange(item?.title || item?.name)
		setIsOpen(false)
		onChange('')
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
			onChange('')
		}
	}

	// Обработчик клика вне поля поиска
	const handleClickOutside = (e: MouseEvent) => {
		if (!e.target || !(e.target instanceof HTMLElement)) return
		if (!e.target.closest('.search-dropdown')) {
			setIsOpen(false)
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

	return (
		<>
			{isPending && (
				<div className='fixed inset-0 z-100 bg-black flex items-center justify-center'>
					<span className='text-white text-xl animate-pulse'>
						Loading...
					</span>
				</div>
			)}

			<div className='relative w-full search-dropdown'>
				<div className='w-full hidden sm:flex items-center justify-center'>
					<div className='w-[100%] md:w-[90%] lg:w-[75%] flex items-center justify-between relative'>
						<input
							type='text'
							className='grow px-2 py-1.5 border-1 rounded-sm shadow transition-all duration-500'
							placeholder='Search movie, tv show or person...'
							value={value}
							onChange={handleChange}
							onKeyDown={handleKeyDown}
							disabled={mobileMenu}
							onFocus={() => fetchMovies(value)}
						/>
						{value && (
							<button
								onClick={() =>
									value.length > 0 &&
									(onChange(''), setIsOpen(false))
								}
								className='absolute right-1 text-sm text-gray-500 cursor-pointer hover:opacity-70'
							>
								<X size={24} />
							</button>
						)}
					</div>
				</div>
				{isOpen && results.length > 0 && (
					<ul
						ref={listRef}
						className='absolute z-10 w-full bg-white dark:bg-black border mt-1 rounded-md shadow max-h-[50dvh] overflow-auto'
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
						<Link
							onClick={() => (setIsOpen(false), onChange(''))}
							href='/search'
						>
							<li
								key={
									results.filter(item => !!item.poster_path)
										.length
								}
								onMouseEnter={() =>
									setHighlightedIndex(
										results.filter(
											item => !!item.poster_path
										).length
									)
								}
								className={`p-2 cursor-pointer border-b ${
									highlightedIndex ===
									results.filter(item => !!item.poster_path)
										.length
										? 'bg-gray-100 dark:text-black'
										: 'hover:bg-gray-100 dark:hover:text-black'
								}`}
							>
								<div className='flex items-center gap-2'>
									<span>Advanced search</span>
									<Search size={20} />
								</div>
							</li>
						</Link>
					</ul>
				)}
			</div>
		</>
	)
}

export default SearchDropdown