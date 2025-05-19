import Link from 'next/link'
import Image from 'next/image'
import { CommonMedia } from '@/lib/movieTypes'

export default function MediaRecommendation({
	recommendation,
	type = 'media',
	mediaType = 'Media',
}: {
	recommendation: CommonMedia[]
	type: string
	mediaType?: string
}) {
	return (
		<>
			<h2 className='text-2xl font-medium mt-5 border-t-2 pt-5'>
				{type === 'media' ? 'Recommendations' : mediaType}
			</h2>

			<div className='w-full overflow-x-auto custom-scrollbar mt-5 pb-5 pl-1'>
				<div className='flex gap-2 w-fit'>
					{Array.from(
						new Map(
							recommendation.map(item => [item.id, item])
						).values()
					).map((rec: CommonMedia) => {
						const title =
							rec.media_type === 'movie'
								? rec.original_title
								: rec.name
						const year =
							rec.media_type === 'movie'
								? rec.release_date?.split('-')[0]
								: rec.first_air_date?.split('-')[0]

						const link =
							rec.media_type === 'movie'
								? `/movie/${rec.id}-${title
										?.split(' ')
										.join('-')
										.toLowerCase()}`
								: `/show/${rec.id}-${title
										?.split(' ')
										.join('-')
										.toLowerCase()}`

						return (
							<Link
								prefetch={true}
								key={rec.id + mediaType + rec.type}
								href={link}
								className='flex-shrink-0 w-[300px] rounded-lg overflow-hidden shadow hover:shadow-lg transition hover:opacity-50'
							>
								<div className='relative w-full aspect-[4/2]'>
									{rec.backdrop_path ? (
										<Image
											src={`https://image.tmdb.org/t/p/w500${rec.backdrop_path}`}
											alt={title || 'No title'}
											fill
											className='object-cover'
											sizes='150px'
										/>
									) : (
										<div className='w-full h-full flex items-center justify-center text-sm text-gray-500'>
											No image
										</div>
									)}
								</div>
								<div className='p-2 flex flex-col border-l border-b border-r'>
									<p className='font-semibold text-md truncate'>
										{title}
									</p>
									<p className='my-1 text-gray-500 text-sm'>
										Year: {year || 'Unknown'}
									</p>
									{rec.vote_average !== 0 && (
										<p className='text-xs'>
											Rating:{' '}
											{rec?.vote_average?.toFixed(1)} ⭐️
										</p>
									)}
									{rec?.character && (
										<p className='mt-2 text-sm text-gray-500'>
											Character: {rec?.character}
										</p>
									)}
								</div>
							</Link>
						)
					})}
				</div>
			</div>
		</>
	)
}
