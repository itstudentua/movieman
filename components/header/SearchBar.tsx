import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { useTransition } from 'react'
import ResultList from './ResultList'
import { motion } from 'framer-motion'
import { CommonMedia } from '@/lib/movieTypes'

type Props = {
	mobileMenu: boolean
	inputValue: string
	setInputValue: (value: string) => void
	showMobileInputSearch: boolean
	setShowMobileInputSearch: (value: boolean) => void
}

const SearchBar = ({
	mobileMenu,
	inputValue,
	setInputValue,
	showMobileInputSearch,
	setShowMobileInputSearch,
}: Props) => {
	const [results, setResults] = useState<CommonMedia[]>([])
	const [isOpen, setIsOpen] = useState(false)
	const [highlightedIndex, setHighlightedIndex] = useState(-1)
	const listRef = useRef<HTMLUListElement | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const router = useRouter()

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 640) {
				setIsOpen(false)
				//setInputValue('')
			}
			if (window.innerWidth >= 640) {
				setIsOpen(false)
				setShowMobileInputSearch(false)
			}
		}

		window.addEventListener('resize', handleResize)

		// сразу проверим на случай, если окно уже больше 640
		handleResize()

		return () => {
			window.removeEventListener('resize', handleResize)
		}
	}, [setShowMobileInputSearch])

	// Функция для получения фильмов с TMDb
	const fetchMovies = async (query: string) => {
		try {
			setIsLoading(true)
			const response = await axios.get(`/api/search?query=${query}`)
			setResults(response.data.results)
			setIsOpen(true)
		} catch (error) {
			console.error('API error:', error)
			setIsLoading(false)
		}
		setIsLoading(false)
	}

	// Обработчик изменения текста
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setInputValue(value)

		if (value.length > 0) {
			fetchMovies(value)
		} else {
			setResults([])
			setIsOpen(false)
		}
	}

	// Обработчик выбора элемента
	const handleSelect = (item: CommonMedia) => {
		setInputValue((item?.title as string) || (item?.name as string))
		setIsOpen(false)
		setShowMobileInputSearch(false)
		setInputValue('')
		setHighlightedIndex(-1)
		startTransition(() => {
			const pageType =
				item.media_type === 'person'
					? 'people'
					: item.media_type === 'tv'
					? 'show'
					: 'movie'

			const slug = `/${pageType}/${item.id}-${(
				(item.title as string) || (item.name as string)
			)
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
			setInputValue('')
		}
	}

	const [isPending, startTransition] = useTransition()

	return (
		<>
			{showMobileInputSearch ? (
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
						value={inputValue}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						className='w-full h-10 px-2 border rounded-sm bg-white dark:bg-black text-black dark:text-white outline-none'
					/>
					<button
						onClick={() =>
							inputValue.length > 0
								? (setInputValue(''), setIsOpen(false))
								: setShowMobileInputSearch(false)
						}
						className='absolute right-5 text-sm text-gray-500 cursor-pointer hover:opacity-70'
					>
						<X size={24} />
					</button>
					{isLoading && (
						<div
							className={`absolute flex justify-center items-center left-0 ${
								showMobileInputSearch ? 'top-15' : ''
							} z-10 w-full bg-white dark:bg-black border mt-1 rounded-md shadow ${
								showMobileInputSearch
									? 'h-[10dvh]'
									: 'h-[10dvh]'
							}`}
						>
							<span className='text-white text-xl animate-pulse'>
								Loading...
							</span>
						</div>
					)}
					{!isLoading && isOpen && results.length > 0 && (
						<ResultList
							listRef={listRef}
							setIsOpen={setIsOpen}
							highlightedIndex={highlightedIndex}
							handleSelect={handleSelect}
							setHighlightedIndex={setHighlightedIndex}
							results={results}
							showMobileInputSearch={showMobileInputSearch}
						/>
					)}
				</motion.div>
			) : (
				<div className='relative w-full search-dropdown'>
					<div className='w-full hidden sm:flex items-center justify-center'>
						<div className='w-[100%] md:w-[90%] lg:w-[75%] flex items-center justify-between relative'>
							<input
								type='text'
								className='grow px-2 py-1.5 border-1 rounded-sm shadow transition-all duration-500'
								placeholder='Search movie, tv show or person...'
								value={inputValue}
								onChange={handleChange}
								onKeyDown={handleKeyDown}
								disabled={mobileMenu}
								onFocus={() => fetchMovies(inputValue)}
							/>
							{inputValue && (
								<button
									onClick={() =>
										inputValue.length > 0 &&
										(setInputValue(''), setIsOpen(false))
									}
									className='absolute right-1 text-sm text-gray-500 cursor-pointer hover:opacity-70'
								>
									<X size={24} />
								</button>
							)}
						</div>
					</div>
					{isLoading && (
						<div
							className={`absolute flex justify-center items-center left-0 ${
								showMobileInputSearch ? 'top-15' : ''
							} z-10 w-full bg-white dark:bg-black border mt-1 rounded-md shadow ${
								showMobileInputSearch
									? 'h-[20dvh]'
									: 'h-[20dvh]'
							}`}
						>
							<span className='text-white text-xl animate-pulse'>
								Loading...
							</span>
						</div>
					)}
					{!isLoading && isOpen && results.length > 0 && (
						<ResultList
							listRef={listRef}
							setIsOpen={setIsOpen}
							highlightedIndex={highlightedIndex}
							handleSelect={handleSelect}
							setHighlightedIndex={setHighlightedIndex}
							results={results}
							showMobileInputSearch={showMobileInputSearch}
						/>
					)}
				</div>
			)}
		</>
	)
}

export default SearchBar
