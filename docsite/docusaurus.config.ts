import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";

const config: Config = {
  title: 'Kaneer Docs',
  tagline: 'Kaneer documentation',
  favicon: 'img/logo.svg',
  future: { v4: true },
  url: 'https://Kaneer-2-0.github.io/',
  baseUrl: '/',
  organizationName: 'Kaneer-2-0',
  projectName: 'Kaneer-docs',
  onBrokenLinks: 'throw',
  i18n: { defaultLocale: 'en', locales: ['en'] },
  markdown: { format: 'detect', mermaid: true },
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'repo-root',
        path: '..',
        routeBasePath: '/',
        include: ['README.md', 'docs/**/*.{md,mdx}', 'docs-cms/**/*.{md,mdx}'],
        exclude: ['docs-cms/templates/*', 'docsite/*', 'docs-cms/static/*'],
        beforeDefaultRemarkPlugins: [remarkGithubAdmonitionsToDirectives],
      },
    ],
  ],
  themes: ['classic', '@docusaurus/theme-mermaid'],
  themeConfig: {
    colorMode: { respectPrefersColorScheme: true },
    navbar: {
      title: 'Kaneer',
      logo: { alt: 'Kaneer', src: 'img/logo.svg' },
      items: [
        {to: '/', label: 'Docs', position: 'left'},
        {href: 'https://github.com/Kaneer-2-0/Kaneer-docs', label: 'GitHub', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {title: 'Docs', items: [{label: 'Kaneer', to: '/'}, {label: 'Docs', to: '/docs'}, {label: 'Docs CMS', to: '/docs-cms'}]},
        {title: 'More', items: [{label: 'GitHub', href: 'https://github.com/Kaneer-2-0/Kaneer-docs'}]},
      ],
      copyright: `Copyright © Kaneer ${new Date().getFullYear()}. Built with Docusaurus.`,
    },
    prism: { theme: prismThemes.github, darkTheme: prismThemes.dracula },
  } satisfies Preset.ThemeConfig,
};

export default config;
