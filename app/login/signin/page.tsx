// /app/login/signin/page.tsx
import { Suspense } from 'react'
import SignInPage from './SignInPage'

export default function LoginPage() {
	return (
		<Suspense>
			<SignInPage />
		</Suspense>
	)
}
