const { default: axios } = require("axios")


const API_KEY = process.env.NEXT_PUBLIC_STRAPI_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_STRAPI_BASE_URL || 'http://localhost:1337';

const axiosClient = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: API_KEY ? {
        'Authorization': `Bearer ${API_KEY}`
    } : {}
})

// Public client for fetching doctors and categories (public endpoints that don't need a token)
const publicClient = axios.create({
    baseURL: `${BASE_URL}/api`
})

const getCategory = () => publicClient.get('/categories?populate=*');

const getDoctorList = () => publicClient.get('/doctors?populate=*');

const getDoctorByCategory = (category) => publicClient.get('/doctors?filters[categories][Name][$in]=' + encodeURIComponent(category) + "&populate=*");

const getDoctorById = (id) => publicClient.get('/doctors/' + id + "?populate=*");

const bookAppointment = (data) => publicClient.post('/appointments', data);

const sendEmail = (data) => axios.post('/api/sendEmail', data);

const getUserBookingList = (userEmail) => publicClient.get("/appointments?[filters][Email][$eq]=" + encodeURIComponent(userEmail) + "&populate[doctor][populate][image][populate][0]=url&populate=*");

const deleteBooking = (id) => publicClient.delete('/appointments/' + id);

const getBookedSlots = (doctorId, dateString) => publicClient.get(`/appointments?filters[doctor][id][$eq]=${doctorId}&filters[Date][$eq]=${dateString}`);
  
  export default{
    getCategory,
    getDoctorList,
    getDoctorByCategory,
    getDoctorById, 
    bookAppointment,
    sendEmail,
    getUserBookingList,
    deleteBooking,
    getBookedSlots
  }