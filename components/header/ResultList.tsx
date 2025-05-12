import { useEffect } from 'react'

type ResultList = {
    id: number
    title?: string
    name?: string
    poster_path?: string
    media_type?: string
    release_date?: string
    runtime?: number
    known_for_department?: string
    known_for?: {
        title?: string
        name?: string
    }[]
    cast?: {
        name: string
    }[]
}


export default function ResultList({
	results,
	listRef,
	setIsOpen,
	highlightedIndex,
	handleSelect,
	setHighlightedIndex,
	showMobileInputSearch,
}: {
	results: ResultList[]
	listRef: React.RefObject<HTMLUListElement | null>
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
	highlightedIndex: number
	handleSelect: (item: any) => void
	setHighlightedIndex: React.Dispatch<React.SetStateAction<number>>
	showMobileInputSearch: boolean
}) {
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
													(actor: { name: string }) =>
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
	)
}