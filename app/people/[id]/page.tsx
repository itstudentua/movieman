// app/show/[id]/page.tsx

import { notFound } from 'next/navigation'
import { getPerson } from '@/utils/api' // Твоя функция для запроса данных о фильмах
import MediaRecommendation from '@/components/mediapage/MediaRecommendations'
import { formatPersonDates } from '@/lib/formatDate'
import PersonBiography from '@/app/people/Bigraphy'

type Params = Promise<{ id: string }>

// Функция для асинхронной загрузки метаданных
export async function generateMetadata({ params }: { params: Params }) {
	// Ждем данные фильма по id, перед тем как использовать его в метаданных
	const { id } = await params
	const person = await getPerson(id)

	return {
		title: 'MovieMan🍿: ' + person?.name,
		description:
			person?.known_for_department || 'No description available.',
	}
}

const PersonPage = async ({ params }: { params: Params }) => {
	// Загружаем данные фильма с использованием params.id

	const { id } = await params
	const person = await getPerson(id)

	if (!person) {
		return notFound() // Если фильм не найден, показываем страницу с ошибкой 404
	}

	console.log(person)

	return (
		<div className='px-3 sm:px-10 max-w-7xl mx-auto mobile-header'>
			<div className='mt-5 sm:mt-10 flex gap-5'>
				{person.profile_path && (
					<div className='relative hidden sm:block w-[250px] aspect-[2/3] flex-shrink-0'>
						<img
							src={`https://image.tmdb.org/t/0p/w500${person.profile_path}`}
							alt={person.name}
							className='rounded shadow-lg'
						/>
					</div>
				)}
				<div className='flex flex-col gap-1 min-w-0'>
					<h1 className='text-3xl font-bold'>{person.name}</h1>
					<p className='text-lg text-gray-700 dark:text-gray-400'>
						{person.known_for_department === 'Acting'
							? 'Actor'
							: person.known_for_department}
					</p>
					<div className='relative block sm:hidden w-[250px] aspect-[2/3] flex-shrink-0 mt-3 mb-4'>
						<img
							src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
							alt={person.name}
							className='rounded shadow-lg'
						/>
					</div>
					{person.birthday && (
						<p className='font-semibold'>
							Birthdate:{' '}
							<span className='text-gray-600'>
								{formatPersonDates(
									person.birthday,
									person?.deathday
								)}
							</span>
						</p>
					)}
					{person.deathday && (
						<p className='font-semibold'>
							Deathday:{' '}
							<span className='text-gray-600'>
								{formatPersonDates(
									person.birthday,
									person?.deathday,
									false
								)}
							</span>
						</p>
					)}
					{person.place_of_birth && (
						<p>
							<span className='font-bold'>Place of birth:</span>{' '}
							{person.place_of_birth}
						</p>
					)}
					{person.biography && (
						<>
							<h3 className='font-bold text-2xl mt-5'>
								Biography
							</h3>
							<PersonBiography biography={person.biography} />
						</>
					)}
				</div>
			</div>

			{person.known_for_department !== 'Acting' &&
				person.crew.length > 0 && (
					<MediaRecommendation
						recommendation={person.crew}
						type='person'
					/>
				)}

			{person.known_for_department === 'Acting' && (
				<>
					{person.movies.length > 0 && (
						<MediaRecommendation
							recommendation={person.movies}
							type='person'
							mediaType='Movies'
						/>
					)}

					{person.tvShows.length > 0 && (
						<MediaRecommendation
							recommendation={person.tvShows}
							type='person'
							mediaType='TV Shows'
						/>
					)}
				</>
			)}
		</div>
	)
}

export default PersonPage
