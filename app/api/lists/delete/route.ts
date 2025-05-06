import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function DELETE(req: NextRequest) {
	const session = await getServerSession(authOptions)
	if (!session?.user.id) {
		return new Response(JSON.stringify({ error: 'Не авторизован' }), {
			status: 401,
		})
	}

	const { searchParams } = new URL(req.url)
	const listId = searchParams.get('listId')

	if (!listId) {
		return new Response(JSON.stringify({ error: 'listId обязателен' }), {
			status: 400,
		})
	}

	try {
		// Удаляем сначала элементы списка
		await prisma.userListItem.deleteMany({
			where: { listId },
		})

		// Затем сам список
		await prisma.userList.delete({
			where: {
				id: listId,
				userId: session.user.id, // чтобы нельзя было удалить чужой список
			},
		})

		// Получаем обновлённые списки
		const updatedLists = await prisma.userList.findMany({
			where: {
				userId: session.user.id,
			},
			orderBy: {
				createdAt: 'desc',
			},
		})

		return new Response(JSON.stringify(updatedLists), { status: 200 })
	} catch (error) {
		console.error('[DELETE LIST ERROR]', error)
		return new Response(JSON.stringify({ error: 'Ошибка при удалении' }), {
			status: 500,
		})
	}
}
