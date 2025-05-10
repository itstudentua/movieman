import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url)
	const id = searchParams.get('id')

	if (!id)
		return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })

	const user = await prisma.user.findUnique({
		where: { id },
		select: {
			name: true,
			surname: true,
		},
	})

	if (!user)
		return NextResponse.json({ error: 'User not found' }, { status: 404 })

	return NextResponse.json(user)
}
