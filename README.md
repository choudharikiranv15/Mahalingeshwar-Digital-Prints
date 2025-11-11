# Mahalingeshwar Digital Prints & Gifts

## 🎨 Your Vision, Our Precision

![Banner Image](https://raw.githubusercontent.com/choudharikiranv15/Mahalingeshwar-Digital-Prints/main/Business%20Card%20Design%20Front%20Part01%20english%20copy.jpg)

Welcome to **Mahalingeshwar Digital Prints & Gifts**, a premier e-commerce platform dedicated to high-quality digital printing services and personalized gift items. Launched in 2020, we leverage cutting-edge technology to transform your memories and designs into tangible, beautiful keepsakes. From custom photo prints and apparel to professional business materials and bespoke gifts, we ensure precision and care in every order.

This project represents a fully functional, modern web application designed for seamless customer experience and efficient business operations.

---

## ✨ Features

- **Dynamic Product Catalog**: Browse a wide range of products with categories, filters, and detailed views.
- **Personalized Gifts**: Options for customizing mugs, t-shirts, MDF blanks, and more.
- **Shopping Cart & Wishlist**: Intuitive cart management with wishlist functionality for saved items.
- **WhatsApp Order Integration**: Streamlined ordering process directly via WhatsApp, including customer details and order summaries.
- **Theme Toggle**: Light and dark mode functionality for enhanced user experience.
- **Responsive Design**: Optimized for seamless viewing and interaction across all devices.
- **Supabase Backend**: Robust and scalable backend for product, order, and customer data management.
- **Netlify Deployment**: Configured for fast, reliable, and secure deployment on Netlify.
- **Admin Analytics & Inventory**: (Planned/Existing) Backend pages for analytics and inventory management to support business operations.
- **Real-time Stock Alerts**: Supabase Edge Function for WhatsApp notifications on low stock.

---

## 🚀 Technologies Used

- **Frontend**: HTML5, CSS3 (Custom, Responsive), JavaScript (Vanilla ES6+)
- **Backend/Database**: Supabase (PostgreSQL, Authentication, Realtime, Edge Functions)
- **Deployment**: Netlify
- **Version Control**: Git, GitHub
- **APIs**: Twilio (for WhatsApp integration in Edge Function)

---

## ⚙️ Setup and Installation

To get this project up and running locally, follow these steps:

1.  **Clone the Repository**:

    ```bash
    git clone https://github.com/choudharikiranv15/Mahalingeshwar-Digital-Prints.git
    cd Mahalingeshwar-Digital-Prints
    ```

2.  **Supabase Configuration**:

    - Create a new project on [Supabase](https://supabase.com/).
    - Configure your database schema using the SQL migration files located in `migrations/`.
    - Update `config.js` and `supabase-service.js` with your Supabase project URL and `anon` key.
    - Deploy the Supabase Edge Function for WhatsApp stock alerts from `supabase/functions/stock-alert-whatsapp/index.ts`. Remember to set up environment variables for Twilio within Supabase.

3.  **Environment Variables (for Supabase Edge Function)**:

    - `SUPABASE_URL`: Your Supabase Project URL.
    - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (for secure backend access).
    - `TWILIO_ACCOUNT_SID`: Your Twilio Account SID.
    - `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token.
    - `TWILIO_WHATSAPP_NUMBER`: Your Twilio WhatsApp-enabled phone number (e.g., `whatsapp:+14155238886`).
    - `WHATSAPP_RECIPIENT`: The phone number to receive alerts (e.g., `+917619147647`).

4.  **Local Development**:
    - This is a static site with client-side JavaScript. No build step is strictly required for local viewing.
    - Open `index.html` directly in your browser, or use a live server extension (e.g., Live Server for VS Code) for a better development experience.

---

## ☁️ Deployment

This project is optimized for deployment on **Netlify**.

1.  **Push to GitHub**: Ensure your project is pushed to a GitHub repository (which you've just done!).
2.  **Connect to Netlify**:
    - Log in to Netlify and click "Add new site" -> "Import an existing project".
    - Connect your GitHub account and select the `Mahalingeshwar-Digital-Prints` repository.
    - **Build command**: Leave empty.
    - **Publish directory**: `.` (a single dot, representing the root of your repository).
    - Click "Deploy site".
3.  **Custom Domain & HTTPS**:
    - After deployment, go to "Site settings" -> "Domain management" to add your custom domain (`yourdomain.com`, `www.yourdomain.com`).
    - Follow Netlify's instructions to configure DNS. Using Netlify DNS is highly recommended for simplicity and to avoid common DNS issues.
    - Netlify automatically provisions an SSL certificate for HTTPS.

---

## 📞 Contact

For any inquiries, collaborations, or support, please reach out to:

- **Kiran Choudhari**
- **WhatsApp**: +91 76191 47647
- **Email**: info@mahalingeshwarprints.com
- **LinkedIn**: [Kiran Choudhari](https://www.linkedin.com/in/kiranchoudhari-1510m)

---

## 📄 License

This project is open-source and available under the MIT License.

---

_Thank you for exploring Mahalingeshwar Digital Prints & Gifts!_
