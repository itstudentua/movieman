import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
	const session = await getServerSession(authOptions)

	if (!session?.user.id) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
		})
	}

	const uniqueMedia = await prisma.userListItem.findMany({
		where: {
			list: {
				userId: session.user.id,
			},
		},
		select: {
			mediaId: true,
		},
		distinct: ['mediaId'],
	})

	return new Response(JSON.stringify({ count: uniqueMedia.length }), {
		status: 200,
	})
}
