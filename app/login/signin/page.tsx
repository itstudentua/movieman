'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
    const { data: session, status } = useSession() // status для отслеживания загрузки сессии
    const [isRegister, setIsRegister] = useState(false)
    const [form, setForm] = useState({
        name: '',
        surname: '',
        login: '',
        password: '',
    })
    const router = useRouter()

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
                alert('Ошибка регистрации')
                return
            }
        }

        const result = await signIn('credentials', {
            login: form.login,
            password: form.password,
            redirect: false,
        })

        if (!result?.error) {
            router.refresh()
        } else {
            alert('Неверный логин или пароль')
        }
    }

    const handleSignOut = async () => {
        await signOut({ 
            redirect: true,
            callbackUrl: '/',
        })
        //router.refresh()
    }

    const handleGoogleSignIn = () => {
        signIn('google', { redirect: true, callbackUrl: '/' }) // Редирект на главную страницу
    }


    if (status === 'loading') {
        return (
            <div className='flex items-center justify-center h-screen'>
                <span>Загрузка...</span>
            </div>
        )
    }

    if (session?.user) {
        return (
            <div className='flex items-center justify-center flex-col'>
                <h1 className='text-2xl'>Привет, {session.user.name}!</h1>
                <button
                    onClick={handleSignOut}
                    className='mt-4 p-2 bg-red-600 text-white rounded'
                >
                    Выйти
                </button>
            </div>
        )
    }

    return (
        <div className='flex items-center justify-center'>
            <form onSubmit={handleSubmit} className='space-y-4 w-full max-w-xs'>
                {isRegister && (
                    <>
                        <input
                            type='text'
                            name='name'
                            placeholder='Имя'
                            onChange={handleChange}
                            className='w-full p-2 border rounded'
                            required
                        />
                        <input
                            type='text'
                            name='surname'
                            placeholder='Фамилия'
                            onChange={handleChange}
                            className='w-full p-2 border rounded'
                            required
                        />
                    </>
                )}
                <input
                    type='text'
                    name='login'
                    placeholder='Логин'
                    onChange={handleChange}
                    className='w-full p-2 border rounded'
                    required
                />
                <input
                    type='password'
                    name='password'
                    placeholder='Пароль'
                    onChange={handleChange}
                    className='w-full p-2 border rounded'
                    required
                />
                <button
                    type='submit'
                    className='w-full p-2 bg-blue-600 text-white rounded'
                >
                    {isRegister ? 'Зарегистрироваться' : 'Войти'}
                </button>
                <button
                    type='button'
                    onClick={handleGoogleSignIn}
                    className='w-full p-2 bg-red-600 text-white rounded'
                >
                    Войти через Google
                </button>
                <p
                    className='text-center text-sm cursor-pointer text-blue-500'
                    onClick={() => setIsRegister(!isRegister)}
                >
                    {isRegister
                        ? 'Уже есть аккаунт? Войти'
                        : 'Нет аккаунта? Зарегистрироваться'}
                </p>
            </form>
        </div>
    )
}
