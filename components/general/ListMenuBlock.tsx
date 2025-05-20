import { Heart, Bookmark, Eye } from 'lucide-react'

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip'

import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { mutate } from 'swr'
import dynamic from 'next/dynamic'

const CreateListDialog = dynamic(
	async () => {
		const mod = await import('@/components/general/CreateListDialog')
		return { default: mod.CreateListDialog }
	},
	{ ssr: false }
)

import DropdownListMenu from './DropdownListMenu'

type ListBlockProps = {
	mediaId?: number
	watchedButton: boolean
	isWatched?: boolean
	setIsWatched?: React.Dispatch<React.SetStateAction<boolean>>
	isFavorite?: boolean
	setIsFavorite?: React.Dispatch<React.SetStateAction<boolean>>
	isWishlist?: boolean
	setIsWishlist?: React.Dispatch<React.SetStateAction<boolean>>
	addUserMedia?: () => Promise<void>
	setIsRefresh?: React.Dispatch<React.SetStateAction<boolean>>
	handleListCreated?: () => Promise<void>
	setIsPaused?: React.Dispatch<React.SetStateAction<boolean>>
	setIsActive?: React.Dispatch<React.SetStateAction<boolean>>
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ListMenuBlock({
	mediaId = -10,
	watchedButton = true,
	isWatched = false,
	setIsWatched = () => {},
	isFavorite = false,
	setIsFavorite = () => {},
	isWishlist = false,
	setIsWishlist = () => {},
	setIsRefresh = () => {},
	addUserMedia = async () => {},
	handleListCreated = async () => {},
	setIsPaused = () => {},
	setIsActive = () => {},
}: ListBlockProps) {
	const [dialogOpen, setDialogOpen] = useState(false)
	const [menuOpen, setMenuOpen] = useState(false)
	const { data: session } = useSession()

	// function to get lists of user
	const {
		data: userLists,
		isLoading: userListsLoading,
	} = useSWR(`/api/lists/get?userId=${session?.user.id}`, fetcher, {
		revalidateOnFocus: true,
	})

	const handleToggle = async (listId: string, mediaId: number) => {
		await fetch('/api/lists/toggle-item', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ listId, mediaId }),
		})

		addUserMedia() // add to usermedia
		handleListCreated()
		await mutate(`/api/lists/get?userId=${session?.user.id}`)
		await mutate(`/api/db`)
	}

	async function listMutate() {
		await mutate(`/api/lists/get?userId=${session?.user.id}`)
		await mutate(`/api/db`)
	}

	useEffect(() => {
		setIsActive(menuOpen)
		if (menuOpen) setIsPaused(true)
	}, [menuOpen, setIsActive, setIsPaused])
	

	if (userListsLoading)
		return (
			<div className='fixed inset-0 z-100 bg-white dark:bg-black flex items-center justify-center'>
				<span className='text-black dark:text-white text-xl animate-pulse'>
					Loading...
				</span>
			</div>
		)

	return (
		<div className='flex gap-4 mt-3'>
			{watchedButton && (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							//className='hover:opacity-70 cursor-pointer'
							variant={isWatched ? 'active' : 'myStyle'}
							size='icon'
							onClick={() => {
								setIsWatched(prev => !prev)
								setIsRefresh(true)
							}}
						>
							<Eye className='w-5 h-5' />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						{isWatched ? 'Watched' : 'Unwatched'}
					</TooltipContent>
				</Tooltip>
			)}
			<DropdownListMenu 
				setIsRefresh={setIsRefresh}
				mediaId={mediaId}
				userLists={userLists}
				menuOpen={menuOpen}
				setMenuOpen={setMenuOpen} 
				handleToggle={handleToggle}
				setDialogOpen={setDialogOpen} />
			
			<CreateListDialog
				open={dialogOpen}
				setOpen={setDialogOpen}
				handleListCreated={handleListCreated}
				listMutate={listMutate}
			/>

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						title='Mark as Favourite'
						variant={isFavorite ? 'active' : 'myStyle'}
						size='icon'
						onClick={() => {
							setIsFavorite(prev => !prev)
							setIsRefresh(true)
						}}
					>
						<Heart className='w-5 h-5' />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					{isFavorite ? 'Favorite' : 'Mark as Favorite'}
				</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						title='Add to Wishlist'
						variant={isWishlist ? 'active' : 'myStyle'}
						size='icon'
						onClick={() => {
							setIsWishlist(prev => !prev)
							setIsRefresh(true)
						}}
					>
						<Bookmark className='w-5 h-5' />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					{isWishlist ? 'In wishlist' : 'Add to Wishlist'}
				</TooltipContent>
			</Tooltip>
		</div>
	)
}
