import apiClient from './axios'
import axios from 'axios'

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

type UserListResponse = {
  id: string | number
  name: string
  itemsCount: number
  createdAt: string
  updatedAt: string
}

export type UserList = {
  id: string
  name: string
  itemsCount: number
  createdAt: string
  updatedAt: string
}

type CreateUserListPayload = {
  name: string
}

type UserListRestaurantsResponse = {
  id: string | number
  name: string
  restaurants: UserListRestaurantResponse[]
}

type UserListRestaurantResponse = {
  id: string | number
  name: string
  address?: string | null
  city?: string | null
  country?: string | null
  addedAt?: string | null
}

export type UserListRestaurant = {
  id: string
  name: string
  address: string | null
  city: string | null
  country: string | null
  addedAt: string | null
}

export type UserListRestaurants = {
  id: string
  name: string
  restaurants: UserListRestaurant[]
}

function normalizeUserList(list: UserListResponse): UserList {
  return {
    id: String(list.id),
    name: list.name,
    itemsCount: list.itemsCount,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  }
}

function normalizeUserListRestaurant(restaurant: UserListRestaurantResponse): UserListRestaurant {
  return {
    id: String(restaurant.id),
    name: restaurant.name,
    address: restaurant.address ?? null,
    city: restaurant.city ?? null,
    country: restaurant.country ?? null,
    addedAt: restaurant.addedAt ?? null,
  }
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

export async function getUserLists(userId: string | number): Promise<UserList[]> {
  const { data } = await apiClient.get<UserListResponse[]>(`/api/v1/users/${userId}/lists`)
  return data.map(normalizeUserList)
}

export async function createUserList(
  userId: string | number,
  payload: CreateUserListPayload,
): Promise<UserList> {
  const { data } = await apiClient.post<UserListResponse>(`/api/v1/users/${userId}/lists`, payload)
  return normalizeUserList(data)
}

export async function getUserListRestaurantsByName(
  userId: string | number,
  listName: string,
): Promise<UserListRestaurants> {
  const encodedListName = encodeURIComponent(listName)
  try {
    const { data } = await apiClient.get<UserListRestaurantsResponse>(
      `/api/v1/users/${userId}/lists/by-name/${encodedListName}/restaurants`,
    )

    return {
      id: String(data.id),
      name: data.name,
      restaurants: (data.restaurants ?? []).map(normalizeUserListRestaurant),
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return {
        id: '',
        name: listName,
        restaurants: [],
      }
    }

    throw error
  }
}
