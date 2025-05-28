// app/api/movies/route.ts

import { NextResponse } from 'next/server'

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url)
	const page = Number(searchParams.get('page') || '1')
	const category = String(searchParams.get('category')|| 'top_rated')
	const type = String(searchParams.get('type') || 'movie')

	const API_KEY = process.env.TMDB_API_KEY

	// Если ключ не найден, возвращаем ошибку
	if (!API_KEY) {
		return NextResponse.json(
			{ error: 'API_KEY is not defined' },
			{ status: 500 }
		)
	}

	const url = `https://api.themoviedb.org/3/${type}/${category}?api_key=${API_KEY}&language=en-US&region=US&page=${page}`

	try {
		const res = await fetch(url)

		if (!res.ok) {
			const errorData = await res.json()
			console.error('API Error:', errorData)
			return NextResponse.json(
				{ error: 'Ошибка при получении фильмов' },
				{ status: 500 }
			)
		}

		const data = await res.json()
		return NextResponse.json(data)
	} catch (error) {
		console.error('Request error:', error)
		return NextResponse.json(
			{ error: 'Error data loading' },
			{ status: 500 }
		)
	}
}
