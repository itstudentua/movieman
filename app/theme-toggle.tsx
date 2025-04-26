'use client'

import { Switch } from '@/components/ui/switch'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
	const { theme, setTheme, systemTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) return null // Избегаем проблем с гидратацией

	const currentTheme = theme === 'system' ? systemTheme : theme

	return (
		// <button
		// 	className='p-2 rounded-lg bg-gray-200 dark:bg-gray-800'
		// 	onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
		// >
		// 	{currentTheme === 'dark' ? '🌞' : '🌙'}
		// </button>
		<Switch
		className='cursor-pointer hover:opacity-70 hidden md:block'
			checked={currentTheme === 'dark'}
			onCheckedChange={() => setTheme(
				currentTheme === 'dark' ? 'light' : 'dark'
			)}
		/>
	)
}
