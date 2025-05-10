import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PATCH(req: NextRequest) {
	const session = await getServerSession(authOptions)

	if (!session?.user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const searchParams = req.nextUrl.searchParams
	const id = searchParams.get('id')
	const name = searchParams.get('name')

	if (!id || !name || typeof name !== 'string') {
		return NextResponse.json(
			{ error: 'ID and name are required' },
			{ status: 400 }
		)
	}

	try {
		// Проверка: список принадлежит пользователю
		const existingList = await prisma.userList.findUnique({
			where: { id },
		})

		if (!existingList || existingList.userId !== session.user.id) {
			return NextResponse.json(
				{ error: 'Not found or forbidden' },
				{ status: 404 }
			)
		}

		// Проверка на дубликат имени
		const duplicate = await prisma.userList.findFirst({
			where: {
				userId: session.user.id,
				name: name.trim(),
				NOT: { id },
			},
		})

		if (duplicate) {
			return NextResponse.json(
				{ error: 'Список с таким именем уже существует' },
				{ status: 409 }
			)
		}

		// Обновление
		const updatedList = await prisma.userList.update({
			where: { id },
			data: { name: name.trim() },
		})

		return NextResponse.json(updatedList, { status: 200 })
	} catch (error) {
		console.error(error)
		return NextResponse.json({ error: 'Server error' }, { status: 500 })
	}
}
