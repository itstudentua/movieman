'use client'

import { useEffect } from 'react'

export default function LoadingPage() {

	useEffect(() => {
		
		document.body.classList.add('no-scroll')

		return () => {
			document.body.classList.remove('no-scroll')
		}
	}, [])

	return (
		<div className='fixed inset-0 z-100 dark:bg-black bg-white flex items-center justify-center'>
			<span className='dark:text-white text-black text-xl animate-pulse'>
				Loading...
			</span>
		</div>
	)
}
