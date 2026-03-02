# 📚 EduCore

EduCore is a modern, scalable tuition management web app designed to help teachers and tuition centers manage students, track fees, monitor pending dues, and visualize monthly financial insights — with future expansion into full tuition operations (attendance, batches, performance, messaging, etc.).

🚀 **Live Demo:** https://edu-core-eight.vercel.app/

---

## 🧠 Features (v1)

This initial version includes:

- Teacher authentication (signup/login)
- Student management (add/edit/list)
- Record and track monthly fee payments
- Visual dashboard with:
  - Monthly financial summary
  - Pending fee notifications
  - Recent activity list
- Clean UI with Light & Dark mode support
- Mobile-responsive design
- Built for long-term scalability

---

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (React) + TypeScript |
| Styling | TailwindCSS / shadcn UI |
| Backend | REST API (Node.js + Express / or Next.js API routes) |
| Database | PostgreSQL |
| Deployment | Vercel |
| State Management | React hooks / Zustand (future) |

---

## 🚀 Getting Started (Local)

Follow these steps to run the project locally.

### 1️⃣ Clone the repo
git clone https://github.com/<YOUR_USERNAME>/edu-core.git
cd edu-core

2️⃣ Install dependencies
cd frontend
npm install
# or
yarn install

3️⃣ Setup Environment Variables
Create a .env.local file:
NEXT_PUBLIC_API_URL=http://localhost:5000

4️⃣ Run the Development Server
npm run dev

The app should be running at http://localhost:3000.

🧪 API (Backend)
If you have a backend:
Base URL:
/api/v1

Example endpoints:

Resource	Method	Endpoint
Auth	POST	/auth/signup
Auth	POST	/auth/login
Students	GET	/students
Students	POST	/students
Payments	POST	/students/:id/payments
Dashboard	GET	/dashboard

📁 Folder Structure
frontend/
├── public/
├── src/
│   ├── app/                # Pages
│   ├── components/         # UI & feature components
│   ├── hooks/              # Custom hooks
│   ├── services/           # API calls
│   ├── store/              # State
│   └── styles/             # Tailwind tokens & CSS

🎨 UI & UX Principles
EduCore follows:
Minimal and intuitive UI
Financial clarity and ease of use
Scalable screens (dashboard, students, profile)
Light & Dark mode variants
Accessibility best practices

📆 Future Roadmap

✔️ V1 – Fee tracking, student management, dashboard
🔜 V2 – Attendance module
🔜 V3 – Batch & timetable management
🔜 V4 – Parent portal & notifications
🔜 V5 – Online payments + invoice generation
🔜 V6 – Analytics & reporting

🤝 Contributing
Contributions are welcome!
Fork the project
Create your feature branch (git checkout -b feature/YourFeature)
Commit your changes (git commit -m 'Add new feature')
Push to the branch
Create a Pull Request

📜 License
MIT License © Sarthak

🙌 Thank you

Thanks for checking out EduCore!
Built with ❤️ for tuition teachers and education centers.
