// utils/api.ts

import axios from 'axios'
//api.themoviedb.org/3/movie/511619?api_key=bf3723e35a8315d4c529c4ec2b92422a&language=en
// export const getMovie = async (id: string) => {
// 	const API_KEY = process.env.TMDB_API_KEY

// 	try {
// 		const response = await axios.get(
// 			`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en`
// 			//`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}&language=en-US`,
// 		)
// 		return response.data // Возвращаем данные о фильме
// 	} catch (error) {
// 		console.error('Error fetching movie:', error)
// 		return null // В случае ошибки возвращаем null
// 	}
// }

export const getMovie = async (id: string) => {
	const API_KEY = process.env.TMDB_API_KEY

	try {
		// Запрос данных о фильме
		const response = await axios.get(
			`https://api.themoviedb.org/3/movie/${id}`,
			{
				params: {
					api_key: API_KEY,
					language: 'en',
					append_to_response:
						'credits,images,videos,recommendations,similar,release_dates,external_ids',
				},
			}
		)

		// Тут не нужен отдельный запрос, потому что `credits` уже включены в append_to_response

		return response.data // Возвращаем данные о фильме
	} catch (error) {
		console.error('Error fetching movie data:', error)
		return null // В случае ошибки возвращаем null
	}
}


export const getShow = async (id: string) => {
	const API_KEY = process.env.TMDB_API_KEY

	try {
		// Запрос данных о сериале
		const response = await axios.get(
			`https://api.themoviedb.org/3/tv/${id}`,
			{
				params: {
					api_key: API_KEY,
					language: 'en',
					append_to_response:
						'credits,images,videos,seasons,recommendations,similar,content_ratings,external_ids',
				},
			}
		)

		// Запрос всех актёров через aggregate_credits
		const castResponse = await axios.get(
			`https://api.themoviedb.org/3/tv/${id}/aggregate_credits`,
			{
				params: {
					api_key: API_KEY,
					language: 'en',
				},
			}
		)

		// Объединяем данные о сериале с полным списком актёров
		response.data.credits.cast = castResponse.data.cast

		return response.data // Возвращаем данные о сериале с полным списком актёров
	} catch (error) {
		console.error('Error fetching show data:', error)
		return null // В случае ошибки возвращаем null
	}
}


export const getPerson = async (id: string) => {
	const API_KEY = process.env.TMDB_API_KEY
	const BASE_URL = 'https://api.themoviedb.org/3/person'

	try {
		// Получаем основную информацию об актёре
		const [personRes, creditsRes] = await Promise.all([
			axios.get(`${BASE_URL}/${id}?api_key=${API_KEY}&language=en`),
			axios.get(
				`${BASE_URL}/${id}/combined_credits?api_key=${API_KEY}&language=en`
			),
		])

		const person = personRes.data
		const credits = creditsRes.data

		return {
			id: person.id,
			name: person.name,
			birthday: person.birthday,
			deathday: person.deathday,
			place_of_birth: person.place_of_birth,
			biography: person.biography,
			profile_path: person.profile_path,
			known_for_department: person.known_for_department,
			popularity: person.popularity,
			gender: person.gender,
			credits: {
				cast: credits.cast.sort(
					(a: any, b: any) => (b.popularity || 0) - (a.popularity || 0)
				),
				crew: credits.crew,
			},
		}
	} catch (error) {
		console.error('Error fetching person with credits:', error)
		return null
	}
}