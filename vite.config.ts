import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages serves project sites from a /<repo>/ subpath
  base: process.env.GITHUB_PAGES ? '/ae-bootcamp-capstone-wordcrawlers/' : '/',
  plugins: [react()]
});
