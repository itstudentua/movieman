import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'image.tmdb.org',
				//hostname: '**', // Разрешает любые домены
			},
		],
	},
}

export default nextConfig
