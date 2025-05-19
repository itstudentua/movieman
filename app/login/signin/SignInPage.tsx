'use client'

import { signIn, useSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import RoutToMain from './RoutToMain'
import { toast } from 'sonner'

export default function SignInPage() {
    const { data: session, status } = useSession() // status для отслеживания загрузки сессии
    const [isRegister, setIsRegister] = useState(false)
    const [form, setForm] = useState({
        name: '',
        surname: '',
        login: '',
        password: '',
    })
    const router = useRouter()

    const searchParams = useSearchParams()
	const callbackUrl = searchParams.get('callbackUrl') || '/'

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (isRegister) {
            const res = await fetch('/api/register', {
                method: 'POST',
                body: JSON.stringify(form),
                headers: { 'Content-Type': 'application/json' },
            })

            if (!res.ok) {
                alert('Registration error')
                return
            }
        }

        const result = await signIn('credentials', {
			login: form.login,
			password: form.password,
			redirect: true,
			callbackUrl,
		})
        
        if (!result?.error) {
            router.refresh()
        } else {
            toast('Wrong login or password')
            setForm({
				name: '',
				surname: '',
				login: '',
				password: '',
			})
            
        }
    }


    const handleGoogleSignIn = () => {
		const searchParams = new URLSearchParams(window.location.search)
		const callbackUrl = searchParams.get('callbackUrl') || '/'

		signIn('google', { redirect: true, callbackUrl })
	}


    if (status === 'loading') {
        return (
            <div className='flex items-center justify-center h-screen'>
                <span>Loading...</span>
            </div>
        )
    }

    if (session?.user) {
        return(
            <RoutToMain />
        )
    }

    return (
		<div className='flex items-center justify-center h-full w-full'>
			<form onSubmit={handleSubmit} className='space-y-4 w-full max-w-xs'>
				{isRegister && (
					<>
						<input
							type='text'
							name='name'
                            value={form.name}
							placeholder='Name'
							onChange={handleChange}
							className='w-full p-2 border rounded'
							required
						/>
						<input
							type='text'
							name='surname'
                            value={form.surname}
							placeholder='Surname'
							onChange={handleChange}
							className='w-full p-2 border rounded'
							required
						/>
					</>
				)}
				<input
					type='text'
					name='login'
                    value={form.login}
					placeholder='Login'
					onChange={handleChange}
					className='w-full p-2 border rounded'
					required
				/>
				<input
					type='password'
					name='password'
                    value={form.password}
					placeholder='Password'
					onChange={handleChange}
					className='w-full p-2 border rounded'
					required
				/>
				<button
					type='submit'
					className='cursor-pointer hover:opacity-70 w-full p-2 bg-black text-white dark:bg-white dark:text-black font-semibold rounded'
				>
					{isRegister ? 'Sign up' : 'Sign in'}
				</button>
				<button
					type='button'
					onClick={handleGoogleSignIn}
					className='cursor-pointer hover:opacity-55 w-full p-2 bg-blue-600 text-white rounded'
				>
					{isRegister ? 'Sign up ' : 'Sign in '}with google
				</button>
				<p
					className='hover:opacity-65 text-center text-sm cursor-pointer text-black dark:text-white'
					onClick={() => setIsRegister(!isRegister)}
				>
					{isRegister
						? 'Already have an account? Sign in'
						: "Don't have an account? Sign up"}
				</p>
			</form>
		</div>
	)
}
