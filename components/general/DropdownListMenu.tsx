import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuCheckboxItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus } from 'lucide-react'

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

type DropdownListMenuProps = {
    mediaId: number
    userLists: any[]
    menuOpen: boolean
    setMenuOpen: (open: boolean) => void
    setDialogOpen: (open: boolean) => void
    setIsRefresh: (refresh: boolean) => void
    handleToggle: (listId: string, mediaId: number) => Promise<void>

}

export default function DropdownListMenu({mediaId, setDialogOpen, userLists, menuOpen, setMenuOpen, setIsRefresh, handleToggle}: DropdownListMenuProps) {
	return (
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
	)
}
