'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { MobileMenuButton } from './MobileMenuButton'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from 'next-themes'

interface Props {
	toggle: () => void
	clearInput: () => void
	isOpen: boolean
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function MobileMenu({ toggle, clearInput, isOpen, setIsOpen }: Props) {
	const { theme, setTheme } = useTheme()

	useEffect(() => {
		if (isOpen) {
			document.body.classList.add('overflow-hidden')
		} else {
			document.body.classList.remove('overflow-hidden')
		}
		return () => document.body.classList.remove('overflow-hidden')
	}, [isOpen])

	return (
		<>
			<MobileMenuButton
				isOpen={isOpen}
				toggle={() => {
					setIsOpen(!isOpen)
					toggle()
				}}
			/>
			{createPortal(
				<AnimatePresence>
					{isOpen && (
						<motion.div
							key='mobile-menu'
							initial={{ opacity: 0, y: -30 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -30 }}
							transition={{ duration: 0.3 }}
							className='fixed inset-0 z-40 bg-black/50 backdrop-blur-xl overflow-y-auto pt-20 pb-5'
							onClick={() => {
								setIsOpen(false)
								toggle()
							}}
						>
							<div className='min-h-[calc(100dvh-100px)] flex flex-col items-center justify-center w-full px-5 sm:px-10'>
								<ul
									onClick={e => e.stopPropagation()}
									className='text-white text-xl space-y-4 w-[70%] max-w-md text-center'
								>
									<li
										onClick={() => {
											setTheme(
												theme === 'dark'
													? 'light'
													: 'dark'
											)
										}}
										className='bg-black text-white dark:bg-white dark:text-black py-2 px-5 rounded-md text-2xl font-semibold hover:opacity-80 cursor-pointer'
									>
										Theme: {theme === 'dark' ? '🌝' : '🌞'}
									</li>
									
									<li
										onClick={() => {
											setIsOpen(false)
											toggle()
										}}
										className='bg-black text-white dark:bg-white dark:text-black rounded-md text-2xl font-semibold hover:opacity-80 cursor-pointer'
									>
										<Link
											prefetch={true}
											href='/movies'
											onClick={clearInput}
											className='block w-full h-full py-2 px-5'
										>
											Movies
										</Link>
									</li>
									<li
										onClick={() => {
											setIsOpen(false)
											toggle()
										}}
										className='bg-black text-white dark:bg-white dark:text-black rounded-md text-2xl font-semibold hover:opacity-80 cursor-pointer'
									>
										<Link
											prefetch={true}
											href='/tvshows'
											onClick={clearInput}
											className='block w-full h-full py-2 px-5'
										>
											TV Shows
										</Link>
									</li>
									<li
										onClick={() => {
											setIsOpen(false)
											toggle()
										}}
										className='bg-black text-white dark:bg-white dark:text-black rounded-md text-2xl font-semibold hover:opacity-80 cursor-pointer'
									>
										<Link
											prefetch={true}
											href='/settings'
											onClick={clearInput}
											className='block w-full h-full py-2 px-5'
										>
											Settings
										</Link>
									</li>
								</ul>
							</div>
						</motion.div>
					)}
				</AnimatePresence>,
				document.body
			)}
		</>
	)
}
