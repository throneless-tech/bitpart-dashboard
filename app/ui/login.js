'use client'

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';

export function LoginForm() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <form action={action}>
      {/* <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" placeholder="Email" />
      </div>
      {state?.errors?.email && <p>{state.errors.email}</p>} */}

      <div>
        <label htmlFor="code">Access code</label>
        <input id="code" name="code" type="password" />
      </div>
      {state?.errors?.code && <p>{state.errors.code}</p>}

      <button disabled={pending} type="submit">
        Sign Up
      </button>
    </form>
  )
}
