import NextAuth, { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import type { AdapterUser } from 'next-auth/adapters'
import type { JWT } from 'next-auth/jwt'
import type { Account, Session, User } from 'next-auth'

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			authorization: {
				params: {
					prompt: 'select_account'
			}}
		}),
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				login: { label: 'Login', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.login || !credentials.password) return null

				const user = await prisma.user.findUnique({
					where: { login: credentials.login },
				})

				if (!user) return null

				const isValid = await bcrypt.compare(
					credentials.password,
					user.passwordHash || ''
				)
				if (!isValid) return null

				return user
			},
		}),
	],
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: 'jwt',
	},
	callbacks: {
		async session({ session, token }: { session: Session; token: JWT }) {
			if (token && session.user) {
				session.user.id = token.sub as string
			}
			return session
		},

		async signIn({
			user,
			account,
			profile,
			email,
			credentials,
		}: {
			user: User | AdapterUser
			account: Account | null
			profile?: any
			email?: { verificationRequest?: boolean }
			credentials?: Record<string, unknown>
		}) {
			if (account?.provider === 'google') {
				const existingUser = await prisma.user.findUnique({
					where: { email: user.email || '' },
				})

				if (existingUser) {
					await prisma.account.upsert({
						where: {
							provider_providerAccountId: {
								provider: account.provider,
								providerAccountId: account.providerAccountId,
							},
						},
						update: {
							userId: existingUser.id,
							access_token: account.access_token,
							refresh_token: account.refresh_token,
							id_token: account.id_token,
							type: 'oauth',
						},
						create: {
							provider: account.provider,
							providerAccountId: account.providerAccountId,
							userId: existingUser.id,
							access_token: account.access_token,
							refresh_token: account.refresh_token,
							id_token: account.id_token,
							type: 'oauth',
						},
					})
				} else {
					const nameParts = user.name?.split(' ') || []
					const newUser = await prisma.user.create({
						data: {
							name: nameParts[0] || '',
							surname: nameParts[1] || '',
							email: user.email || '',
							image: user.image || '',
							login: user.email?.split('@')[0] || '',
							passwordHash: '',
						},
					})

					await prisma.account.create({
						data: {
							provider: account.provider,
							providerAccountId: account.providerAccountId,
							userId: newUser.id,
							access_token: account.access_token,
							refresh_token: account.refresh_token,
							id_token: account.id_token,
							type: 'oauth',
						},
					})
				}
			}

			return true
		},
	},
}

const handler = NextAuth(authOptions)

export { handler }
