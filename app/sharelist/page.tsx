import ShareListComponent from './ShareListComponent'
import { Suspense } from 'react'

export default async function ShareListPage() {
	return (
		<Suspense>
			<ShareListComponent />
		</Suspense>
	)
}
