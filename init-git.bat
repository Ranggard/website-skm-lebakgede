@echo off
cd /d "d:\Rangga\Kerja Praktek\Aplikasi Buat KP\Website-SKM"
git init
git config user.name "Development"
git config user.email "dev@skm-survey.local"
git add .
git commit -m "Initial commit: Project scaffolding with Next.js and TypeScript"
echo Git repository initialized successfully
