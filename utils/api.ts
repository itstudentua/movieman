// utils/api.ts

import axios from 'axios'


const API_KEY = process.env.TMDB_API_KEY

export const getMovie = async (id: string) => {

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
			movies: credits.cast
				.filter(
					(item: { media_type: string }) =>
						item.media_type === 'movie'
				)
				.sort(
					(a: { popularity: number }, b: { popularity: number }) =>
						(b.popularity || 0) - (a.popularity || 0)
				),
			tvShows: credits.cast
				.filter(
					(item: { media_type: string }) => item.media_type === 'tv'
				)
				.sort(
					(a: { popularity: number }, b: { popularity: number }) =>
						(b.popularity || 0) - (a.popularity || 0)
				),
			crew: credits.crew,
		}
	} catch (error) {
		console.error('Error fetching person with credits:', error)
		return null
	}
}


// lib/tmdb.ts

const ENDPOINTS: Record<string, string> = {
	top_rated: '/movie/top_rated',
	upcoming: '/movie/upcoming',
	trending: '/trending/movie/week',
}

export async function getPopularMovies(
	type: 'top_rated' | 'upcoming' | 'trending'
) {
	const BASE_URL = 'https://api.themoviedb.org/3'
	const endpoint = ENDPOINTS[type]
const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US&region=US`

	const res = await fetch(url, { cache: 'no-store' })
	if (!res.ok) throw new Error('Ошибка при загрузке фильмов')
	const data = await res.json()
	if (endpoint === '/movie/upcoming') 	return data.results.filter(
		(movie: {release_date: Date}) => new Date(movie.release_date).getTime() > Date.now()
	)
	return data.results
}
