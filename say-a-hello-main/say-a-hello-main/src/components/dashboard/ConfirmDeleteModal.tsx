import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDeleteModalProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  taskName: string
}

const ConfirmDeleteModal = ({ open, onConfirm, onCancel, taskName }: ConfirmDeleteModalProps) => {
  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        {/* Dark overlay that covers everything */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[90]" />

        {/* Modal content */}
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background p-6 rounded-lg shadow-lg z-[1001] w-[90vw] max-w-md border"
          onInteractOutside={(e) => e.preventDefault()} // Prevent closing when clicking outside
        >
          <Dialog.Title className="text-lg font-semibold mb-4">Confirm Deletion</Dialog.Title>
          <Dialog.Description className="mb-6">
            Are you sure you want to delete "{taskName}"? This action cannot be undone.
          </Dialog.Description>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel}>
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
