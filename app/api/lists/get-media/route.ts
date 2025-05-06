import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url)
	const listId = searchParams.get('listId')
	const userId = searchParams.get('userId')

	if (!listId || !userId) {
		return NextResponse.json(
			{ error: 'Missing listId or userId' },
			{ status: 400 }
		)
	}

	try {
		// Получаем mediaId из списка
		const items = await prisma.userListItem.findMany({
			where: { listId },
			select: { mediaId: true },
		})

		const mediaIds = items.map(item => item.mediaId)

		if (mediaIds.length === 0) {
			return NextResponse.json([])
		}

		// Получаем медиа по userId и mediaId
		const media = await prisma.userMedia.findMany({
			where: {
				userId,
				mediaId: { in: mediaIds },
			},
		})

		return NextResponse.json(media)
	} catch (error) {
		console.error('Ошибка получения медиа:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
