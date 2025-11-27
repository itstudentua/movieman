'use client'

import dynamic from 'next/dynamic'
import LazyToaster from '@/components/general/LazyToaster'
import { useEffect } from 'react'


const ScrollToTopButton = dynamic(
	() => import('@/components/general/ScrollToTopButton'),
	{ ssr: false }
)

const Header = dynamic(
	() => import('@/components/header/Header'),
	{ ssr: false }
)

export default function MainPageClientWrapper({
	children,
}: {
	children: React.ReactNode
}) {
	
	useEffect(() => {
		fetch('/api/log-visitor', { method: 'POST' }).catch(console.error)
	}, [])
	return (
		<div className='flex flex-col h-[100dvh] transition-colors duration-300 w-full min-w-[300px]'>
			<div className='mt-[65px]'></div>

			<Header />
			<main className='grow'>{children}</main>
			<footer className='p-3 font-semibold flex justify-center items-center'>
				MovieMan {new Date().getFullYear()}
			</footer>
			<ScrollToTopButton />
			<LazyToaster />
		</div>
	)
}
