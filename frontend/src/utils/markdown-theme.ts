import githubCss from 'highlight.js/styles/github.css?inline'
import githubDarkCss from 'highlight.js/styles/github-dark.css?inline'
import githubMdLightCss from 'github-markdown-css/github-markdown.css?inline'
import githubMdDarkCss from 'github-markdown-css/github-markdown-dark.css?inline'

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
