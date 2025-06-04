import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { Inter } from 'next/font/google'
import SessionWrapper from '@/components/general/SessionWrapper'
import MainPageClientWrapper from '@/components/mainpage/MainPageClientWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'MovieMan',
	description: 'Your own movie library',
	icons: {
		icon: '/icon.png',
		apple: '/apple-touch-icon.png',
	},
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
						<MainPageClientWrapper>
							{children}
						</MainPageClientWrapper>
					</SessionWrapper>
				</ThemeProvider>
			</body>
		</html>
	)
}
