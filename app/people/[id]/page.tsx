// app/show/[id]/page.tsx

import { notFound } from 'next/navigation'
import { getPerson } from '@/utils/api' // Твоя функция для запроса данных о фильмах


type Params = Promise<{ id: string }>

// Функция для асинхронной загрузки метаданных
export async function generateMetadata({ params }: { params: Params }) {
    // Ждем данные фильма по id, перед тем как использовать его в метаданных
    const { id } = await params
    const person = await getPerson(id)

    return {
        title: "MovieMan🍿: " + person?.name,
        description: person?.known_for_department || 'No description available.',
    }
}

const PersonPage = async ({ params }: { params: Params }) => {
    // Загружаем данные фильма с использованием params.id
    
    const { id } = await params
    const person = await getPerson(id)

    if (!person) {
        return notFound() // Если фильм не найден, показываем страницу с ошибкой 404
    }

//	console.log(movie);
    

    return (
		<div className='p-4'>
			<h1 className='text-3xl font-bold mb-2'>{person.name}</h1>
			<p className='mb-4 text-gray-600'>{person.birthday}</p>
			<p className='mb-6'>{person.place_of_birth}</p>
			{person.profile_path && (
				<img
					src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
					alt={person.name}
					className='rounded shadow-lg'
				/>
			)}
		</div>
	)
}

export default PersonPage
