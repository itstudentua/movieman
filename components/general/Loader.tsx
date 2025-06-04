export default function LoadingPage() {
	return (
		<div className='fixed inset-0 z-100 dark:bg-black bg-white flex items-center justify-center'>
			<span className='dark:text-white text-black text-xl animate-pulse'>
				Loading...
			</span>
		</div>
	)
}
