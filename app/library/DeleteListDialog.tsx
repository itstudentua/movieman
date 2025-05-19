import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Trash } from 'lucide-react'


type DeleteListDialogProps = {
	selectedListName: string
	selectedListId: string
	handleListDelete: (listId: string) => Promise<void>
}

export default function DeleteListDialog({
	selectedListName,
	selectedListId,
	handleListDelete,
}: DeleteListDialogProps) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Trash className='w-6 h-6 text-black dark:text-white cursor-pointer' />
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription>
						{`This action will permanently delete the ${selectedListName}
										list and cannot be undone.`}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel className='cursor-pointer hover:opacity-70'>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => handleListDelete(selectedListId)}
						className='cursor-pointer hover:opacity-70'
					>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}