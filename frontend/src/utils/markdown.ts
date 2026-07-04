import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
// @ts-ignore
import katexPlugin from 'markdown-it-katex'
// @ts-ignore
import taskListsPlugin from 'markdown-it-task-lists'
import githubCss from 'highlight.js/styles/github.css?inline'
import githubDarkCss from 'highlight.js/styles/github-dark.css?inline'
import githubMdLightCss from 'github-markdown-css/github-markdown.css?inline'
import githubMdDarkCss from 'github-markdown-css/github-markdown-dark.css?inline'

let mdInstance: MarkdownIt | null = null

/**
 * 创建或获取 markdown-it 实例（单例），集成 highlight.js 代码高亮 + KaTeX 数学公式 + Mermaid 图表。
 */
export function getMarkdownRenderer(): MarkdownIt {
  if (mdInstance) return mdInstance

  mdInstance = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false,
    highlight(str: string, lang: string): string {
      // Mermaid 代码块渲染为占位 div，由前端 mermaid 库异步渲染
      if (lang === 'mermaid') {
        return `<div class="mermaid">${mdInstance!.utils.escapeHtml(str)}</div>`
      }
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
        } catch {
          /* fallback */
        }
      }
      try {
        return `<pre class="hljs"><code>${hljs.highlightAuto(str).value}</code></pre>`
      } catch {
        return `<pre class="hljs"><code>${mdInstance!.utils.escapeHtml(str)}</code></pre>`
      }
    },
  })

  // KaTeX 数学公式插件
  mdInstance.use(katexPlugin)

  // Task Lists 插件（GitHub 风格任务列表）
  mdInstance.use(taskListsPlugin)

  return mdInstance
}

/**
 * 将 markdown 文本渲染为 HTML 字符串。
 */
export function renderMarkdown(content: string): string {
  return getMarkdownRenderer().render(content)
}

// 本地样式（通过 Vite ?inline 导入 CSS 文本，不依赖 CDN）
let hljsLight: HTMLStyleElement | null = null
let hljsDark: HTMLStyleElement | null = null
let mdLight: HTMLStyleElement | null = null
let mdDark: HTMLStyleElement | null = null

/**
 * 切换 highlight.js + github-markdown 主题（浅色/深色），全部使用本地文件。
 */
export function loadHighlightTheme(theme: 'light' | 'dark'): void {
  if (!hljsLight) {
    hljsLight = document.createElement('style')
    hljsLight.textContent = githubCss
    document.head.appendChild(hljsLight)

    hljsDark = document.createElement('style')
    hljsDark.textContent = githubDarkCss
    document.head.appendChild(hljsDark)

    mdLight = document.createElement('style')
    mdLight.textContent = githubMdLightCss
    document.head.appendChild(mdLight)

    mdDark = document.createElement('style')
    mdDark.textContent = githubMdDarkCss
    document.head.appendChild(mdDark)
  }
  hljsLight.disabled = theme === 'dark'
  if (hljsDark) hljsDark.disabled = theme === 'light'
  if (mdLight) mdLight.disabled = theme === 'dark'
  if (mdDark) mdDark.disabled = theme === 'light'
}
