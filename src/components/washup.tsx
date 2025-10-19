'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function WashupButton() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE ALL DATA') {
      toast.error('Invalid confirmation', {
        description: 'Please type "DELETE ALL DATA" exactly to confirm.',
      });
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch('/api/washup', {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Success', {
          description: 'All data has been deleted successfully.',
        });
        setOpen(false);
        setConfirmText('');
        
        // Refresh the page after successful deletion
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        throw new Error('Failed to delete data');
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to delete data. Please try again.',
      });
      console.log(error)
    } finally {
      setIsDeleting(false);
    }
  };

  const isConfirmValid = confirmText === 'DELETE ALL DATA';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Washup
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Delete All Data</DialogTitle>
          </div>
          <DialogDescription className="pt-3 text-base">
            This action cannot be undone. This will permanently delete all
            tables, seats, and guests from the database.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-sm font-medium">
              Type <span className="font-mono font-semibold">DELETE ALL DATA</span> to confirm
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE ALL DATA"
              className="font-mono"
              disabled={isDeleting}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setConfirmText('');
            }}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmValid || isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete All Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}