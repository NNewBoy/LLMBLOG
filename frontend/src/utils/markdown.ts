import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

let mdInstance: MarkdownIt | null = null

/**
 * 创建或获取 markdown-it 实例（单例），集成 highlight.js 代码高亮。
 */
export function getMarkdownRenderer(): MarkdownIt {
  if (mdInstance) return mdInstance

  mdInstance = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false,
    highlight(str: string, lang: string): string {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
        } catch {
          /* fallback */
        }
      }
      // 未指定语言或语言不支持时，使用自动检测
      try {
        return `<pre class="hljs"><code>${hljs.highlightAuto(str).value}</code></pre>`
      } catch {
        return `<pre class="hljs"><code>${mdInstance!.utils.escapeHtml(str)}</code></pre>`
      }
    },
  })

  return mdInstance
}

/**
 * 将 markdown 文本渲染为 HTML 字符串。
 */
export function renderMarkdown(content: string): string {
  return getMarkdownRenderer().render(content)
}

/**
 * 动态加载 highlight.js 主题 CSS（浅色/深色）。
 * 返回清理函数（移除旧 link 标签）。
 */
let currentThemeLink: HTMLLinkElement | null = null

export async function loadHighlightTheme(theme: 'light' | 'dark'): Promise<void> {
  // 移除旧主题
  if (currentThemeLink) {
    currentThemeLink.remove()
    currentThemeLink = null
  }

  const cssFile = theme === 'dark' ? 'github-dark' : 'github'
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/${cssFile}.min.css`
  currentThemeLink = link
  document.head.appendChild(link)
}
