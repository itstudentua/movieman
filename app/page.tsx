'use client'

import { signOut, useSession } from 'next-auth/react'


export default function HomePage() {
	const { data: session, status } = useSession() // status для отслеживания загрузки сессии
	
	const handleSignOut = async () => {
		await signOut({ 
			redirect: true,
			callbackUrl: '/',
		})
		//router.refresh()
	}

	if (status === 'loading') {
		return (
			<div className='flex items-center justify-center'>
				<span>Загрузка...</span>
			</div>
		)
	}

	if (session?.user) {
		return (
			<div className='flex items-center justify-center flex-col'>
				<h1 className='text-2xl'>Это главная страница, привет отседово, {session.user.name}!</h1>
				<button
					onClick={handleSignOut}
					className='mt-4 p-2 bg-red-600 text-white rounded'
				>
					Выйти	
				</button>
			</div>
		)
	}

}
