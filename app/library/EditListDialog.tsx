'use client'

import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil } from 'lucide-react'
import { useState } from 'react'

type EditListDialogProps = {
	currentName: string
	onSave: (newName: string) => Promise<void>
}

export default function EditListDialog({
	currentName,
	onSave,
}: EditListDialogProps) {
	const [name, setName] = useState(currentName)
	
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Pencil className='w-6 h-6 text-black dark:text-white cursor-pointer' />
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit List Name</DialogTitle>
				</DialogHeader>
				<Input
					value={name}
					onChange={e => setName(e.target.value)}
					placeholder='Enter new list name'
				/>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant='outline'>Cancel</Button>
					</DialogClose>
					<DialogClose asChild>
						<Button onClick={() => onSave(name)}>
							Save
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
