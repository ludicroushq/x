import createMDX from 'fumadocs-mdx/config'

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

export default withMDX(nextConfig)
