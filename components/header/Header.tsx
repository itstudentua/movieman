'use client'

import ThemeToggle from '@/app/theme-toggle'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Skeleton } from '@/components/ui/skeleton'

import { useState } from 'react'
import { Search } from 'lucide-react' // иконка лупы
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

const UserDropdownMenu = dynamic(() => import('../header/UserDropdownMenu'), {
	ssr: false,
	loading: () => <Skeleton className='w-[40px] h-[40px]' />,
})

const SearchBar = dynamic(() => import('../header/SearchBar'), {
	ssr: false,
	loading: () => <Skeleton className='w-[40px] h-[40px]' />,
})

const MobileMenu = dynamic(() => import('../general/MobileMenu'), {
	ssr: false,
	loading: () => <Skeleton className='w-[40px] h-[40px]' />,
})

export default function Header() {
	const { data: session, status } = useSession() // status для отслеживания загрузки сессии
	const [showMobileInputSearch, setShowMobileInputSearch] = useState(false)
	const [mobileMenu, setMobileMenu] = useState(false) // for disable search input and mobile search icon when menu is open
	const [inputValue, setInputValue] = useState('')
	const [isOpen, setIsOpen] = useState(false) // mobile menu

	const pathname = usePathname()

	return (
		<header className='w-full dark:bg-black bg-white border-b fixed top-0 z-50'>
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
					<SearchBar
						inputValue={inputValue}
						setInputValue={setInputValue}
						mobileMenu={mobileMenu}
						showMobileInputSearch={showMobileInputSearch}
						setShowMobileInputSearch={setShowMobileInputSearch}
					/>
				</div>

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
								<UserDropdownMenu
									session={session}
									setIsOpen={setIsOpen}
								/>
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
