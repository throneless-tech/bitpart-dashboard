// 'use client'

// import { useActionState } from 'react';
// import { login } from '@/app/actions/auth';

// export function LoginForm() {
//   const [state, action, pending] = useActionState(signup, undefined);

//   return (
//     <form action={action}>
//       {/* <div>
//         <label htmlFor="email">Email</label>
//         <input id="email" name="email" type="email" placeholder="Email" />
//       </div>
//       {state?.errors?.email && <p>{state.errors.email}</p>} */}

//       <div>
//         <label htmlFor="password">Access code</label>
//         <input id="password" name="password" type="password" />
//       </div>
//       {state?.errors?.password && <p>{state.errors.password}</p>}

//       <button disabled={pending} type="submit">
//         Sign Up
//       </button>
//     </form>
//   )
// }


import { signIn } from "@/auth"

export function LoginForm() {
  return (
    <form
      action={async (formData) => {
        "use server"
        signIn("credentials", formData, { redirectTo: "/dashboard" }).then(res => console.log('RES!!!!!', res))
        
      }}
    >
      {/* <label>
        Email
        <input name="email" type="email" />
      </label> */}
      <label>
        Enter your code
        <input name="password" type="password" />
      </label>
      <button>Sign In</button>
    </form>
  )
}