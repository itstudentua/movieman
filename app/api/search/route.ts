import { NextResponse } from 'next/server'

import { MediaItem, CastMember } from '@/lib/movieTypes'

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url)
	const query = searchParams.get('query')

	if (!query) {
		return NextResponse.json({ results: [] })
	}

	const API_KEY = process.env.TMDB_API_KEY
	const language = 'en-US'

	try {
		const res = await fetch(
			`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(
				query
			)}&language=${language}`
		)
		const data = await res.json()

		if (!data.results || data.results.length === 0) {
			return NextResponse.json({ results: [] })
		}

		const details = await Promise.all(
			data.results.map(async (item: MediaItem) => {
				if (item.media_type === 'movie') {
					// Подробности о фильме
					const movieRes = await fetch(
						`https://api.themoviedb.org/3/movie/${item.id}?api_key=${API_KEY}&language=${language}`
					)
					const movieData = await movieRes.json()

					// Актеры
					const creditsRes = await fetch(
						`https://api.themoviedb.org/3/movie/${item.id}/credits?api_key=${API_KEY}&language=${language}`
					)
					const creditsData = await creditsRes.json()

					const cast: CastMember[] =
						creditsData.cast
							?.slice(0, 5)
							.map((actor: CastMember) => ({
								id: actor.id,
								name: actor.name,
								character: actor.character,
								profile_path: actor.profile_path,
							})) || []

					return {
						...item,
						title: item.title,
						runtime: movieData.runtime,
						cast,
					}
				}

				if (item.media_type === 'tv') {
					// Подробности о сериале
					const tvRes = await fetch(
						`https://api.themoviedb.org/3/tv/${item.id}?api_key=${API_KEY}&language=${language}`
					)
					const tvData = await tvRes.json()

					// Актеры
					const creditsRes = await fetch(
						`https://api.themoviedb.org/3/tv/${item.id}/credits?api_key=${API_KEY}&language=${language}`
					)
					const creditsData = await creditsRes.json()

					const cast: CastMember[] =
						creditsData.cast
							?.slice(0, 5)
							.map((actor: CastMember) => ({
								id: actor.id,
								name: actor.name,
								character: actor.character,
								profile_path: actor.profile_path,
							})) || []

					return {
						...item,
						release_date: item?.first_air_date,
						title: item.name,
						runtime: tvData.episode_run_time?.[0] || null,

						cast,
					}
				}

				if (item.media_type === 'person') {
					// Просто возвращаем информацию о человеке
					return {
						...item,
						poster_path: item.profile_path,
						name: item.name,
						known_for: item.known_for,
					}
				}

				return item
			})
		)

		return NextResponse.json({ results: details })
	} catch (err) {
		console.error('Error fetching TMDb data:', err)
		return NextResponse.json({ results: [] }, { status: 500 })
	}
}
