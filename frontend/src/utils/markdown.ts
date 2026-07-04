import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
// @ts-ignore
import katexPlugin from 'markdown-it-katex'
// @ts-ignore
import taskListsPlugin from 'markdown-it-task-lists'

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
