// types/next-auth.d.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from 'next-auth'

declare module 'next-auth' {
	interface Session {
		user: {
			id: string // Добавляем id пользователя
			name?: string | null
			email?: string | null
			image?: string | null
		}
	}
}
