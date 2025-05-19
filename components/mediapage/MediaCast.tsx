import Image from 'next/image'
import Link from 'next/link'
import { CastMember } from '@/lib/movieTypes'


export default function MediaCast({
	cast,
	mediaType
}: {
	cast: CastMember[]
	mediaType: string
}) {
	return (
		<>
			<h2 className='text-2xl font-medium mt-5 border-t-2 pt-5'>
				{mediaType === 'tv' ? 'Series cast' : 'Movie cast'}
			</h2>

			<div className='w-full overflow-x-auto custom-scrollbar mt-5 pb-5 pl-1'>
				<div className='flex gap-2 w-fit'>
					{cast.map((person: CastMember, index: number) => (
						<Link
							prefetch={true}
							key={`${person.id}-${index}`}
							href={`/people/${person.id}`}
							className='flex-shrink-0 w-[130px] rounded-lg overflow-hidden shadow hover:shadow-lg transition hover:opacity-50 border h-fit'
						>
							<div className='relative w-full aspect-[4/5]'>
								{person.profile_path ? (
									<Image
										src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
										alt={person.name as string}
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
							<div className='p-2 flex flex-col gap-1'>
								<p className='font-semibold text-sm truncate'>
									{person.name}
								</p>
								<p className='text-xs text-gray-500 truncate'>
									{mediaType === 'tv'
										? person?.roles?.[0]?.character
										: person?.character}
								</p>
								{mediaType === 'tv' && (
									<p className='text-xs text-gray-400'>
										Episodes: {person.total_episode_count}
									</p>
								)}
							</div>
						</Link>
					))}
				</div>
			</div>
		</>
	)
}
