# 🌍 TripTeller

**TripTeller** is a creative travel story-sharing platform where users can write short stories about places they’ve been, tag destinations by mood (chill, party, nature, etc.), and discover new locations through authentic travel experiences — not generic guides.

---

## 🛠️ Tech Stack

**Frontend:**
- EJS Templating
- CSS (custom styled with Segoe UI + clean design)

**Backend:**
- Node.js
- Express.js
- MongoDB + Mongoose

**Other:**
- Nodemailer (Gmail integration)
- bcrypt (Password hashing)
- dotenv (Environment config)
- express-session (Session-based login)
- Leaflet.js (Map rendering)

---

## 🚀 Features (MVP)

- 🔐 **User Authentication** (Signup/Login with Email Verification)
- ✅ **Email Verification** via Gmail + Nodemailer
- 📬 **Contact Us** form with email notification
- 🧳 **Travel Post CRUD** (Create, Read, Update, Delete)
- 📸 **Upload Images** for posts (optional)
- 🗺️ **Interactive Map** with [Leaflet.js]
- 🎨 **Modern UI** with clean responsive design
- 🔒 **Protected Routes** with session-based auth
- 📨 Real-time **feedback messages** on login/signup actions

---

## 📦 Setup Instructions

1. **Clone the repo**
    ```bash
    git clone https://github.com/yourusername/tripteller.git
    cd tripteller
2. **Create a .env file**
    SESSION_SECRET=yourSecret
    MONGO_URI=yourMongoURI
    EMAIL_USER=yourGmail@gmail.com
    EMAIL_PASS=yourAppPassword
    CONTACT_EMAIL=yourGmail@gmail.com
    PORT=3000
3.  **Run the server**
    ```bash
    node app.js
4.  **View in browser**
    Open http://localhost:3000
##  **Or**

    https://travelpet.onrender.com/

#   ✨Inspiration
    This project is part of my journey to become a fullstack developer. I wanted to build something creative and real-world inspired — combining my love of travel with web development.

#   🤝 Contributing
    Pull requests are welcome. For major changes, please open an issue first.

# 📬 Contact
    Built with ❤️ by Misha
    Email: mishadyshkant132@gmail.com
    GitHub: github.com/Pandonn1o
    LinkedIn: https://www.linkedin.com/in/misha-dyshkant-5374942b3/


# 🧭 Future Improvements
    Google Maps integration
    Social login (Google/Facebook)
    AI-generated story suggestions
    Progressive Web App support