import { useEffect } from 'react'

import { CommonMedia } from '@/lib/movieTypes'
import Image from 'next/image'

export default function ResultList({
	results,
	listRef,
	setIsOpen,
	highlightedIndex,
	handleSelect,
	setHighlightedIndex,
	showMobileInputSearch,
}: {
	results: CommonMedia[]
	listRef: React.RefObject<HTMLUListElement | null>
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
	highlightedIndex: number
	handleSelect: (item: CommonMedia) => void
	setHighlightedIndex: React.Dispatch<React.SetStateAction<number>>
	showMobileInputSearch: boolean
}) {
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
	}, [highlightedIndex, listRef])

	useEffect(() => {
		// Обработчик клика вне поля поиска
		const handleClickOutside = (e: MouseEvent) => {
			if (!e.target || !(e.target instanceof HTMLElement)) return
			if (!e.target.closest('.search-dropdown')) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	return (
		<ul
			ref={listRef}
			className={`absolute left-0 ${
				showMobileInputSearch ? 'top-15' : ''
			} z-10 w-full bg-white dark:bg-black border mt-1 rounded-md shadow ${
				showMobileInputSearch ? 'max-h-[70dvh]' : 'max-h-[50dvh]'
			} overflow-auto`}
		>
			{results
				.filter(item => !!item.poster_path) // Убираем все без постера
				.map((item, index) => (
					<li
						key={item.id}
						onClick={() => handleSelect(item)}
						onMouseEnter={() => setHighlightedIndex(index)}
						className={`p-2 cursor-pointer border-b ${
							highlightedIndex === index
								? 'bg-gray-100 dark:text-black'
								: 'hover:bg-gray-100 dark:hover:text-black'
						}`}
					>
						<div className='flex items-center'>
							{/* <img
								src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
								alt={item.title || item.name}
								className='rounded shadow-lg h-15'
							/> */}
							<Image
								src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
								alt={
									(item.title as string) ||
									(item.name as string)
								}
								className='rounded shadow-lg'
								height={100}
								width={70}
							/>
							<div className='flex flex-col ml-4'>
								<h3 className='font-semibold text-xl'>
									{item.title || item.name}
								</h3>
								<p className='text-xs text-gray-500'>
									{item.media_type !== 'person' ? (
										<>
											{item.media_type === 'tv'
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
												item?.runtime !== null && (
													<>
														{' | '}
														{item.runtime} min
													</>
												)}
										</>
									) : (
										<>
											{item?.known_for_department}
											{item?.known_for?.length && (
												<>
													{' | '}
													{item.known_for
														.map(
															actor =>
																actor?.title ??
																actor?.name ??
																''
														)
														.filter(Boolean)
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
													actor =>
														actor.name as string
												)
												.join(', ')
										: ''}
								</p>
							</div>
						</div>
					</li>
				))}
		</ul>
	)
}
