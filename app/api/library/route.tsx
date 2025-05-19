// app/api/user-lists/route.ts

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
	const session = await getServerSession(authOptions)

	if (!session?.user?.id) {
		return new Response('Unauthorized', { status: 401 })
	}


	const userMedia = await prisma.userMedia.findMany({
		where: {
			userId: session.user.id,
		},
	})

	return Response.json(userMedia)
}
