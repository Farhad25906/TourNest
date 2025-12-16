import { UserRole } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import { UserController } from "./user.controller";

import { fileUploader } from "../../helper/fileUploader";
import { UserValidation } from "./user.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get("/", auth(UserRole.ADMIN), UserController.getAllFromDB);

router.get(
  "/me",
  auth(UserRole.ADMIN, UserRole.HOST, UserRole.TOURIST),
  UserController.getMyProfile
);

router.post(
  "/create-tourist",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createTouristValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return UserController.createTourist(req, res, next);
  }
);

router.post(
  "/create-admin",
  // auth(UserRole.ADMIN),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createAdminValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return UserController.createAdmin(req, res, next);
  }
);

router.post(
  "/create-host",
  auth(UserRole.ADMIN),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    console.log(JSON.parse(req.body.data));
    req.body = UserValidation.createHostValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return UserController.createHosts(req, res, next);
  }
);

router.patch(
    '/update-my-profile',
    auth(UserRole.ADMIN, UserRole.HOST, UserRole.TOURIST),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;
        let validationSchema;
        
        if (user?.role === UserRole.TOURIST) {
            validationSchema = UserValidation.updateTouristValidationSchema;
        } else if (user?.role === UserRole.HOST) {
            validationSchema = UserValidation.updateHostValidationSchema;
        } else if (user?.role === UserRole.ADMIN) {
            validationSchema = UserValidation.updateAdminValidationSchema;
        } else {
            return next(new Error('Invalid user role'));
        }
        
        try {
            // Process form data - convert empty strings to null for optional fields
            const processedData = { ...req.body };
            
            // For each field, if it's an empty string and not required, convert to null
            Object.keys(processedData).forEach(key => {
                if (processedData[key] === '' && !['name', 'email'].includes(key)) {
                    processedData[key] = null;
                }
            });
            
            console.log('Processed data before validation:', processedData);
            
            // Parse and validate the data
            const validatedData = validationSchema.parse(processedData);
            
            console.log('Validated data:', validatedData);
            
            // Replace req.body with validated data
            req.body = validatedData;
            return UserController.updateMyProfile(req, res, next);
        } catch (error) {
            console.error('Validation error:', error);
            return next(error);
        }
    }
);

router.patch(
  "/:id/status",
  auth(UserRole.ADMIN),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.updateStatusValidationSchema.parse(req.body);
    return UserController.changeProfileStatus(req, res, next);
  }
);

export const userRoutes = router;
