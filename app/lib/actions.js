'use server'
import { verifySession } from '@/app/lib/dal';

export async function serverAction() {
  const session = await verifySession();

  // Return early if user is not authorized to perform the action
  if (!session) {
    return null
  }

  // Proceed with the action for authorized users
}