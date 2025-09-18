import { z } from 'zod'
import { canCreateUser } from '@/validations'
import { ROLES } from '@/lib/constants'
import { uuid } from '@/lib/crypto'
import { parseRequest } from '@/lib/request'
import { unauthorized, json, badRequest } from '@/lib/response'
import { createUser, getUserByEmail } from '@/queries'

export async function POST(request: Request) {
  const schema = z.object({
    id: z.string().uuid().optional(),
    clerkId: z.string(),
    email: z.string().email(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    imageUrl: z.string().url().optional(),
    displayName: z.string().optional(),
    role: z.string().regex(/admin|user|view-only/i),
  })

  const { auth, body, error } = await parseRequest(request, schema)

  if (error) {
    return error()
  }

  if (!(await canCreateUser(auth))) {
    return unauthorized()
  }

  const { id, clerkId, email, firstName, lastName, imageUrl, displayName, role } = body

  const existingUser = await getUserByEmail(email, { showDeleted: true })

  if (existingUser) {
    return badRequest('User already exists')
  }

  const user = await createUser({
    user_id: id || uuid(),
    clerk_id: clerkId,
    email,
    first_name: firstName,
    last_name: lastName,
    image_url: imageUrl,
    display_name: displayName,
    role: role ?? ROLES.user,
  })

  return json(user)
}
