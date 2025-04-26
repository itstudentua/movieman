'use client'

import { motion } from 'framer-motion'

interface Props {
	isOpen: boolean
	toggle: () => void
}

export function MobileMenuButton({ isOpen, toggle }: Props) {
	return (
		<button
			onClick={toggle}
			className='flex flex-col justify-center items-center w-10 h-10 relative z-51 cursor-pointer hover:opacity-80'
		>
			<motion.span
				className='block w-6 h-[3px] bg-black dark:bg-white rounded absolute'
				animate={{
					rotate: isOpen ? 45 : 0,
					y: isOpen ? 0 : -8,
				}}
				transition={{ duration: 0.2 }}
			/>
			<motion.span
				className='block w-6 h-[3px] bg-black dark:bg-white rounded absolute'
				animate={{
					opacity: isOpen ? 0 : 1,
				}}
				transition={{ duration: 0.2 }}
			/>
			<motion.span
				className='block w-6 h-[3px] bg-black dark:bg-white rounded absolute'
				animate={{
					rotate: isOpen ? -45 : 0,
					y: isOpen ? 0 : 8,
				}}
				transition={{ duration: 0.2 }}
			/>
		</button>
	)
}
