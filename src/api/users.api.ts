import apiClient from './axios'

type GetCurrentUserResponse = {
  id: string | number
  firstname: string
  lastname: string
  email: string
  photoUrl?: string | null
  photo_url?: string | null
}

export type CurrentUser = {
  id: string
  firstname: string
  lastname: string
  email: string
  photoUrl: string | null
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const { data } = await apiClient.get<GetCurrentUserResponse>('/api/v1/users/me')

  return {
    id: String(data.id),
    firstname: data.firstname,
    lastname: data.lastname,
    email: data.email,
    photoUrl: data.photoUrl ?? data.photo_url ?? null,
  }
}

