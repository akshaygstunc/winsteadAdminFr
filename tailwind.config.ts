import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}','./lib/**/*.{ts,tsx}'],
  theme: { extend: { colors: { bg:'#070b14', panel:'#0b1220', card:'#0f1729', line:'#1e2a42', gold:'#d8b46a', text:'#e8edf7', muted:'#8ea0c5' }, boxShadow: { luxury:'0 10px 30px rgba(0,0,0,0.35)' } } },
  plugins: [],
};
export default config;
