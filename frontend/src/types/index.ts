export interface R<T = any> {
  code: number
  message: string
  data: T
}

export interface Page<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export interface Tag {
  id: number
  name: string
  description?: string
  color?: string
  note_count?: number
}

export interface NoteSummary {
  id: number
  slug: string
  title: string
  author: string
  summary: string
  status: 'draft' | 'published' | 'hidden'
  is_pinned: boolean
  view_count: number
  comment_count: number
  created_at: string
  updated_at: string
  tags: Tag[]
}

export interface NoteDetail extends NoteSummary {
  content: string
  prev: { slug: string; title: string } | null
  next: { slug: string; title: string } | null
}

export interface Comment {
  id: number
  note_id: number
  parent_id: number | null
  nickname: string
  content: string
  location: string
  terminal: string
  is_author: boolean
  like_count: number
  status: string
  created_at: string
  replies: Comment[]
}

export interface ImageItem {
  id: number
  filename: string
  original_name: string
  path: string
  thumb_path: string
  size: number
  mime: string
  created_at: string
  url: string
  thumb_url: string | null
}

export interface SiteSettings {
  blogger_name: string
  blogger_desc: string
  blogger_avatar: string
  social_links: Record<string, string>
  site_favicon: string
  site_name: string
  site_desc: string
  site_keywords?: string
  icp_no: string
  icp_url: string
  police_no: string
  police_url: string
  police_logo: string
}

export interface Overview {
  note_count: number
  uv: number
  pv: number
  comment_count: number
}

export interface DayPoint {
  date: string
  pv: number
  uv: number
}

export interface TerminalPoint {
  name: string
  value: number
}

export interface TopNote {
  id: number
  title: string
  slug: string
  view_count: number
}
