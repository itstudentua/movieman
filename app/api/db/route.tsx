import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
	const session = await getServerSession(authOptions)

	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const body = await req.json()

	const existing = await prisma.userMedia.findFirst({
		where: {
			userId: session.user.id,
			mediaId: body.mediaId,
			type: body.type,
		},
	})

	if (existing) {
		// 🔄 Обновляем существующую запись
		const updated = await prisma.userMedia.update({
			where: {
				id: existing.id,
			},
			data: {
				title: body.title,
				year: body.year,
				poster: body.poster,
				rating: body.rating,
				userRating: body.userRating,
				userComment: body.userComment,
				description: body.description,
				isWatched: body.isWatched,
				isFavorite: body.isFavorite,	
				isWishlist: body.isWishlist,
				watchedDate: body.watchedDate
					? new Date(body.watchedDate)
					: null,
			},
		})

		return NextResponse.json(updated)
	}

	// ✅ Если нет записи — создаём
	const newEntry = await prisma.userMedia.create({
		data: {
			userId: session.user.id,
			mediaId: body.mediaId,
			type: body.type,
			title: body.title,
			year: body.year,
			poster: body.poster,
			rating: body.rating,
			userRating: body.userRating,
			userComment: body.userComment,
			description: body.description,
			isWatched: body.isWatched,
			isFavorite: body.isFavorite,
			isWishlist: body.isWishlist,
			watchedDate: body.watchedDate ? new Date(body.watchedDate) : null,
		},
	})

	return NextResponse.json(newEntry)
}



export async function GET(req: Request) {
	const session = await getServerSession(authOptions)

	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const { searchParams } = new URL(req.url)
	const type = searchParams.get('type') // 'movie' или 'tv'

	const media = await prisma.userMedia.findMany({
		where: {
			userId: session.user.id,
			...(type ? { type } : {}), // добавляем фильтр, если есть type
		},
		orderBy: {
			createdAt: 'desc',
		},
	})

	return NextResponse.json(media)
}






