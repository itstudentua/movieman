// app/api/list/toggle/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
	try {
		const { listId, mediaId } = await req.json()

		if (!listId || !mediaId) {
			return NextResponse.json(
				{ error: 'listId и mediaId обязательны' },
				{ status: 400 }
			)
		}

		// Проверка, есть ли уже в списке
		const existing = await prisma.userListItem.findFirst({
			where: { listId, mediaId },
		})

		if (existing) {
			// Удалить
			await prisma.userListItem.delete({ where: { id: existing.id } })
			return NextResponse.json({
				message: 'Removed from list',
				removed: true,
			})
		}

		// Добавить
		await prisma.userListItem.create({
			data: { listId, mediaId },
		})

		return NextResponse.json({ message: 'Добавлено в список', added: true })
	} catch (error) {
		console.error('Ошибка при обновлении списка:', error)
		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
	}
}
