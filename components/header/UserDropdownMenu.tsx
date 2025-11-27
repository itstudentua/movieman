import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Session } from 'next-auth'
import Link from 'next/link'



export default function UserDropdownMenu({session, setIsOpen}: {session: Session, setIsOpen: (value: boolean) => void}) {


    return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Avatar className='mobile-user-icon w-9 h-9 cursor-pointer hover:opacity-75'>
					<AvatarImage
						src={session.user.image?.toString() || '/user.jpg'}
						referrerPolicy='no-referrer'
					/>
					<AvatarFallback>
						{session.user.name?.charAt(0) || 'U'}
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>

			<DropdownMenuContent align='end' className='bg-white dark:bg-black'>

				<DropdownMenuItem asChild>
					<Link
						prefetch={true}
						href='/library'
						className='text-xl sm:text-lg font-semibold sm:font-normal cursor-pointer w-full'
						onClick={() => {setIsOpen(false); sessionStorage.setItem('moviesScrollY', '0')}}
					>
						My library
					</Link>
				</DropdownMenuItem>

				<DropdownMenuItem
					className='text-xl sm:text-lg font-semibold sm:font-normal cursor-pointer'
					onClick={() => signOut()}
				>
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
