/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images:{
        domains:['res.cloudinary.com','lh3.googleusercontent.com', 'doctor-appointment-admin-strapi-0459.onrender.com'],
        remotePatterns: [
            { protocol: 'https', hostname: '**' },
            { protocol: 'http', hostname: '**' },
        ]
    }
};

export default nextConfig;
