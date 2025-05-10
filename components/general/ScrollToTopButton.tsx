'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function ScrollToTopButton() {
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		const handleScroll = () => {
			setVisible(window.scrollY > 300)
		}

		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	if (!visible) return null

	return (
		<button
			onClick={scrollToTop}
			className='fixed bottom-6 right-6 z-50 p-2 rounded-full dark:bg-white dark:text-black bg-black text-white shadow-lg hover:opacity-45 hover:cursor-pointer transition-colors'
			aria-label='Scroll to top'
		>
			<ArrowUp />
		</button>
	)
}
