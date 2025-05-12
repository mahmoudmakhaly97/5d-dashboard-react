import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface ConfirmDeleteModalProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  taskName?: string
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  open,
  onConfirm,
  onCancel,
  taskName,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={(val) => !val && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-lg w-full max-w-sm z-50">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium">Delete Task</Dialog.Title>
            <Dialog.Close asChild>
              <button onClick={onCancel}>
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Are you sure you want to delete {taskName ? `"${taskName}"` : 'this task'}? This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
              Delete
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ConfirmDeleteModal
