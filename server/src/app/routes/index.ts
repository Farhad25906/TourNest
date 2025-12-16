import express from 'express';
import { userRoutes } from '../modules/user/user.route';
import { authRoutes } from '../modules/auth/auth.routes';
import { tourRoutes } from '../modules/tour/tour.route';
import { bookingRoutes } from '../modules/bookings/booking.route';


const router = express.Router();

const moduleRoutes = [
    {
        path: '/users',
        route: userRoutes
    },
    {
        path: '/auth',
        route: authRoutes
    },
    {
        path: '/tour',
        route: tourRoutes
    },
    {
        path: '/bookings',
        route: bookingRoutes
    }
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;