'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function RoutToMain() {
	const { data: session } = useSession()
	const router = useRouter()

	useEffect(() => {
		if (session?.user) {
			router.push('/') // перенаправление на главную
		}
	}, [session, router])

	return (
		<div className='flex items-center justify-center h-screen'>
			<span>Loading...</span>
		</div>
	)
}
