import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Heart, Bookmark, Eye } from 'lucide-react'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

type ListBlockProps = {
	isWatched: boolean
	setIsWatched: React.Dispatch<React.SetStateAction<boolean>>
	isFavorite: boolean
	setIsFavorite: React.Dispatch<React.SetStateAction<boolean>>
	isWishlist: boolean
	setIsWishlist: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ListMenuBlock({
	isWatched,
	setIsWatched,
	isFavorite,
	setIsFavorite,
	isWishlist,
	setIsWishlist,
}: ListBlockProps) {
	return (
		<div className='flex gap-4 mt-3'>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						//className='hover:opacity-70 cursor-pointer'
						variant={isWatched ? 'active' : 'myStyle'}
						size='icon'
						onClick={() => {
							setIsWatched(prev => !prev)
						}}
					>
						<Eye className='w-5 h-5' />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					{isWatched ? 'Watched' : 'Unwatched'}
				</TooltipContent>
			</Tooltip>
			<DropdownMenu>
				<Tooltip>
					<TooltipTrigger asChild>
						<DropdownMenuTrigger asChild>
							<Button variant='myStyle' size='icon'>
								<Plus className='w-5 h-5' />
							</Button>
						</DropdownMenuTrigger>
					</TooltipTrigger>
					<TooltipContent>Add to List</TooltipContent>
				</Tooltip>

				<DropdownMenuContent
					align='end'
					className='bg-white dark:bg-black truncate'
				>
					<DropdownMenuItem
						className='text-sm font-semibold sm:font-normal cursor-pointer'
						onClick={() => {
							setIsWishlist(prev => !prev)
						}}
					>
						{isWishlist ? '✅' : ''} Watch later
					</DropdownMenuItem>
					<DropdownMenuItem
						className='text-sm font-semibold sm:font-normal cursor-pointer'
						onClick={() => alert('Настройки')}
					>
						Some item
					</DropdownMenuItem>
					<Button className='mt-3 cursor-pointer'>
						Create new list
					</Button>
				</DropdownMenuContent>
			</DropdownMenu>

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						title='Mark as Favourite'
						variant={isFavorite ? 'active' : 'myStyle'}
						size='icon'
						onClick={() => {
							setIsFavorite(prev => !prev)
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
