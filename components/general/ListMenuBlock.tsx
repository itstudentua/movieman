import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuCheckboxItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Heart, Bookmark, Eye } from 'lucide-react'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { CreateListDialog } from '@/components/general/CreateListDialog'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { mutate } from 'swr'

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
	setIsActive = () => {}
}: ListBlockProps) {
	const [dialogOpen, setDialogOpen] = useState(false)
	const [menuOpen, setMenuOpen] = useState(false)
	const { data: session } = useSession()

	// function to get lists of user
	const {
		data: userLists,
		error: userListsError,
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
		menuOpen ? setIsActive(true) : setIsActive(false)
		menuOpen && setIsPaused(menuOpen)
	}, [menuOpen])

	if (
		userListsLoading
	)
		return (
			<div className='fixed inset-0 z-100 bg-black flex items-center justify-center'>
				<span className='text-white text-xl animate-pulse'>
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
			<DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
				<Tooltip>
					<TooltipTrigger asChild>
						<DropdownMenuTrigger asChild>
							<Button
								onClick={() => setIsRefresh(true)}
								variant='myStyle'
								size='icon'
							>
								<Plus className='w-5 h-5' />
							</Button>
						</DropdownMenuTrigger>
					</TooltipTrigger>
					<TooltipContent>Add to List</TooltipContent>
				</Tooltip>

				<DropdownMenuContent
					align='end'
					className='bg-white dark:bg-black truncate'
					// onMouseEnter={() => setIsPaused(true)}
					// onMouseLeave={() => setIsPaused(false)}
				>
					{userLists.map((listItem: any) => (
						<DropdownMenuCheckboxItem
							key={listItem.id}
							checked={listItem.items?.some(
								(item: any) => item.mediaId === mediaId
							)}
							className='text-sm font-semibold sm:font-normal cursor-pointer'
							onClick={() => handleToggle(listItem.id, mediaId)}
						>
							{listItem?.name}
						</DropdownMenuCheckboxItem>
					))}
					<Button
						onClick={() => {
							setMenuOpen(false) // Закрываем меню
							setTimeout(() => {
								setDialogOpen(true) // И только потом открываем диалог
							}, 50) // Короткая задержка — чтобы React успел убрать меню
						}}
						className='mt-3 cursor-pointer w-full'
					>
						Create new list
					</Button>
				</DropdownMenuContent>
			</DropdownMenu>

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
