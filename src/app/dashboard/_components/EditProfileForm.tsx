'use client';

import { useActionState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { updateProfile, type ProfileResult } from '@/lib/actions/profile';
import { toast } from '@/components/ui/Toast';

export function EditProfileForm({ currentName }: { currentName: string }) {
  const [state, action, pending] = useActionState<ProfileResult | null, FormData>(
    updateProfile,
    null,
  );

  useEffect(() => {
    if (state?.ok) toast('Profile updated', 'success');
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Input
          name="full_name"
          label="Display name"
          defaultValue={currentName}
          placeholder="Your name"
          required
        />
      </div>
      {state && !state.ok && (
        <p className="text-xs text-danger" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" loading={pending} size="md" variant="secondary">
        Save
      </Button>
    </form>
  );
}
