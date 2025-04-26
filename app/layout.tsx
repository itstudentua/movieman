import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { Inter } from 'next/font/google'
import SessionWrapper from '@/components/general/SessionWrapper'
import Header from '@/components/general/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'MovieMan🍿',
	description: 'Your own movie library',
}

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang='en' suppressHydrationWarning className={inter.className}>
			<body>
				<ThemeProvider
					attribute='class'
					enableSystem
					defaultTheme='system'
				>
					<SessionWrapper>
						<div className='flex flex-col h-[100dvh] transition-colors duration-300 w-full min-w-[300px]'>
							<Header />
							<main className='grow'>{children}</main>

							<footer className='p-3 font-semibold flex justify-center items-center'>
								MovieMan {new Date().getFullYear()}
							</footer>
						</div>
					</SessionWrapper>
				</ThemeProvider>
			</body>
		</html>
	)
}
