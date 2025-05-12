'use client'
import dynamic from 'next/dynamic'

const Toaster = dynamic(() => import('sonner').then(mod => mod.Toaster), {
	ssr: false,
	loading: () => null,
})

export default function LazyToaster() {
	return <Toaster duration={1500} closeButton position='top-center' />
}
