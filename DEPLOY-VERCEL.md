# Deploy Client lên Vercel

- Node.js 24.x, framework Next.js. Giữ branch làm việc `develop`, kiểm tra Production Branch trong dashboard.
- Điền `.env.cloud.example` với URL Java Render thật; API_BE_URL cho BFF/SSR, NEXT_PUBLIC_CONTENT_API_URL cho catalog/CMS.
- AUTH_COOKIE_SECURE=true trên HTTPS; NEXT_PUBLIC_SITE_URL phải là origin public thật.
- Redeploy khi đổi env, nhất là NEXT_PUBLIC_* được cố định lúc build.
- Không đưa DB password, JWT private key hay Cloudinary API secret vào FE.
- CI tại `.github/workflows/ci.yml`: npm ci → check → test → build. Vercel Git integration quản lý auto-deploy riêng.
- Không sửa logic/render/UI chỉ để deploy. Hướng dẫn toàn bộ: repo Java `deploy/DEPLOY-FREE.md`.
