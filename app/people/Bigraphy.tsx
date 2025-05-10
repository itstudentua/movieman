'use client'
import { useState } from 'react'

export default function PersonBiography({biography} : { biography: any}) {
    
    const [expanded, setExpanded] = useState(false)
    return (
		<>
			<p
				className={`mt-1 whitespace-pre-line transition-all duration-300 ${
					expanded ? '' : 'line-clamp-7'
				}`}
			>
				{biography}
			</p>

			{biography.length > 300 && (
				<button
					onClick={() => setExpanded(!expanded)}
					className='mt-2 hover:underline text-sm font-medium hover:cursor-pointer self-end'
				>
					{expanded ? 'Read less' : 'Read more'}
				</button>
			)}
		</>
	)
}