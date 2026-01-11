# JobLoom

JobLoom is a comprehensive job portal application designed to connect job seekers with employers. It facilitates the entire hiring process from job posting and application to interview scheduling and professional networking.

## 🚀 Features

*   **User Roles & Authentication:** Secure login and registration for Job Seekers, Employers, and Admins using JWT and Bcrypt.
*   **Job Management:** Employers can post, edit, and manage job listings. Seekers can search, filter, and apply for jobs.
*   **Interactive Dashboard:**
    *   **Seekers:** Track application status, manage profile, and view recommended jobs.
    *   **Employers:** Manage applications, schedule interviews, and view analytics.
*   **Real-time Communication:** Built-in chat functionality for direct communication between seekers and employers using Socket.io.
*   **Professional Networking:** Network with other professionals, endorse skills, and view skill growth charts (using Recharts).
*   **Payment Integration:** Secure payment processing for premium features using Stripe and Razorpay.
*   **Resume Parsing & File Handling:** Support for resume uploads and parsing.
*   **Email Notifications:** Automated emails for application updates and interview schedules using Nodemailer.
*   **Responsive Design:** Fully responsive UI built with React and Tailwind CSS, featuring smooth animations with Framer Motion.

## 🛠️ Tech Stack

### Frontend
*   **Framework:** React (Vite)
*   **Styling:** Tailwind CSS, Lucide React (Icons)
*   **Animations:** Framer Motion
*   **State Management & API:** Axios, React Router DOM
*   **Charts:** Recharts
*   **Real-time:** Socket.io-client
*   **Payments:** Stripe React SDK

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB (Mongoose)
*   **Authentication:** JSON Web Tokens (JWT), Bcryptjs
*   **Real-time:** Socket.io
*   **Payments:** Stripe, Razorpay
*   **Utilities:** Nodemailer (Email), Multer (File Upload), Puppeteer (PDF/Scraping), ExcelJS/Xlsx (Data handling)
*   **Security:** Helmet, CORS

## 📦 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ayushhh98/JobLoom.git
    cd JobLoom
    ```

2.  **Install Frontend Dependencies:**
    ```bash
    cd JobLoom
    npm install
    ```

3.  **Install Backend Dependencies:**
    ```bash
    cd ../backend
    npm install
    ```

4.  **Environment Variables:**
    Create a `.env` file in the `backend` directory and add the following (replace with your actual credentials):
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    STRIPE_SECRET_KEY=your_stripe_secret_key
    # Add other necessary variables (Razorpay, Email, etc.)
    ```

5.  **Run the Application:**

    *   **Backend:**
        ```bash
        cd backend
        npm start
        ```

    *   **Frontend:**
        ```bash
        cd JobLoom
        npm run dev
        ```

6.  **Access the App:**
    Open your browser and visit `http://localhost:5173` (or the port shown in your terminal).

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.