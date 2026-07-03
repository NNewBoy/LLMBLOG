import request from '@/utils/request'
import type {
  Page,
  NoteSummary,
  NoteDetail,
  Tag,
  Comment,
  ImageItem,
  SiteSettings,
  Overview,
  DayPoint,
  TerminalPoint,
  TopNote,
  EntryStats,
} from '@/types'

/* ===== auth ===== */
export function sha256Hex(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text)
  return crypto.subtle.digest('SHA-256', buf).then((b) => {
    return Array.from(new Uint8Array(b))
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
  })
}

export const login = (password: string) =>
  request.post<unknown, { token: string; token_type: string }>('/auth/login', { password })

/* ===== settings ===== */
export const getSettings = () => request.get<unknown, SiteSettings>('/settings')
export const getAdminSettings = () => request.get<unknown, SiteSettings>('/settings/admin')
export const updateSettings = (data: Partial<SiteSettings> & { new_password?: string }) =>
  request.put<unknown, SiteSettings>('/settings', data)

/* ===== entry ===== */
export const recordEntryClick = (target: string) =>
  request.post<unknown, any>('/entry/click', { target })

/* ===== notes ===== */
export interface NoteQuery {
  keyword?: string
  tag_id?: number
  tag_ids?: string
  page?: number
  page_size?: number
}
export const listNotes = (q: NoteQuery = {}) =>
  request.get<unknown, Page<NoteSummary>>('/notes', { params: q })
export const getNote = (slug: string) =>
  request.get<unknown, NoteDetail>(`/notes/${slug}`)
export const getTimeline = () => request.get<unknown, Record<string, Record<string, any[]>>>('/notes/timeline')
export const createNote = (data: any) => request.post<unknown, NoteSummary>('/notes', data)
export const updateNote = (id: number, data: any) => request.put<unknown, NoteSummary>(`/notes/${id}`, data)
export const deleteNote = (id: number) => request.delete<unknown, any>(`/notes/${id}`)
export const togglePin = (id: number) => request.put<unknown, any>(`/notes/${id}/pin`)

/* ===== tags ===== */
export const listTags = () => request.get<unknown, Tag[]>('/tags')
export const createTag = (data: Partial<Tag>) => request.post<unknown, Tag>('/tags', data)
export const updateTag = (id: number, data: Partial<Tag>) => request.put<unknown, Tag>(`/tags/${id}`, data)
export const deleteTag = (id: number) => request.delete<unknown, any>(`/tags/${id}`)

/* ===== comments ===== */
export const listComments = (noteId: number, page = 1, sort: 'latest' | 'hot' = 'latest') =>
  request.get<unknown, Page<Comment>>(`/comments/by-note/${noteId}`, { params: { page, sort } })
export const createComment = (noteId: number, data: { nickname: string; content: string; parent_id?: number | null; website?: string }) =>
  request.post<unknown, Comment>(`/comments/by-note/${noteId}`, data)
export const likeComment = (id: number) => request.post<unknown, any>(`/comments/${id}/like`)
export const listAllComments = (params: any) =>
  request.get<unknown, Page<Comment & { note_title: string }>>('/comments/all', { params })
export const toggleCommentHide = (id: number) => request.put<unknown, any>(`/comments/${id}/hide`)
export const deleteComment = (id: number) => request.delete<unknown, any>(`/comments/${id}`)

/* ===== images ===== */
export const listImages = (page = 1, page_size = 24) =>
  request.get<unknown, Page<ImageItem>>('/images', { params: { page, page_size } })
export const uploadImage = (file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  return request.post<unknown, ImageItem>('/images/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
export const deleteImage = (id: number) => request.delete<unknown, any>(`/images/${id}`)

/* ===== stats ===== */
export const getOverview = () => request.get<unknown, Overview>('/stats/overview')
export const getVisitors = (days = 30) =>
  request.get<unknown, DayPoint[]>('/stats/visitors', { params: { days } })
export const getTopNotes = (days = 30, limit = 5) =>
  request.get<unknown, TopNote[]>('/stats/top-notes', { params: { days, limit } })
export const getTerminals = (days = 30) =>
  request.get<unknown, TerminalPoint[]>('/stats/terminals', { params: { days } })
export const getEntryStats = (days = 30) =>
  request.get<unknown, EntryStats>('/stats/entry', { params: { days } })
