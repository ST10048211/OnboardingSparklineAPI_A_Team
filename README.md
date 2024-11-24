
# SparkLine Onboarding API

This project is a Node.js backend application that integrates Firebase for user authentication. It includes endpoints for onboarding users, logging in, OTP verification, and password management. The Firebase Admin SDK handles secure user management.

## Table of Contents

  1. [Features](#features) 
  2. [Project Structure](#project-structure) 
  3. [API Endpoints](#api-endpoints) 
 4.  [Acknowledgments](#acknowledgments) 
  6. [Group Members](#group-members)  
  7.  [License](#license) 
  8.  [Future Enhancements](#future-enhancements) 


---

## Features

- **User Onboarding:** Register new users with email and password.
- **User Login:** Authenticate existing users.
- **OTP Verification:** Placeholder logic for verifying one-time passwords (OTP).
- **Password Management:** Update passwords securely using bcrypt.
- **Firebase Integration:** Leverages Firebase Admin SDK for authentication and user management.

<p align="right">(<a href="#table-of-contents">back to top</a>)</p>

## Project Structure

OnboardingSparklineAPI_A_Team/
├── app.js                   # Main application file
├── routes/
│   └── authRoutes.js        # Authentication routes
├── controllers/
│   └── authController.js    # Authentication logic
├── certificates/
│   └── serviceAccountKey.json # Firebase Service Account Key
├── package.json             # Project dependencies and scripts
├── .env                     # Environment variables` 

<p align="right">(<a href="#table-of-contents">back to top</a>)</p>

## API Endpoints

#### 1. **Onboard User**

-   **POST** `/api/auth/onboard`
-   **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }`
    ```
    
-   **Response**:
     ```json  
    {
      "success": true,
      "uid": "<firebase-user-id>",
      "message": "User onboarded successfully."
    }
    ``` 
    

#### 2. **Login User**

-   **POST** `/api/auth/login`
-   **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ``` 
    
-   **Response**:
    ```json
    {
      "success": true,
      "token": "<firebase-auth-token>"
    }
    ```
    

#### 3. **Verify OTP**

-   **POST** `/api/auth/verify-otp`
-   **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "otp": "123456"
    }
    ``` 
    
-   **Response**:
      ```json
    {
      "success": true,
      "message": "OTP verified. Proceed to change password."
    }
    ``` 
    

#### 4. **Change Password**

-   **POST** `/api/auth/change-password`
-   **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "newPassword": "newpassword123"
    }
    ```
    
    
-   **Response**:

    ```json
    {
      "success": true,
      "message": "Password changed successfully."
    }
    ``` 
 <p align="right">(<a href="#table-of-contents">back to top</a>)</p>   

## Security Notes

-   **Environment Variables:** Used `.env` to manage sensitive configurations securely.
-   **Password Storage:** Passwords are hashed with `bcrypt` before storage.

<p align="right">(<a href="#table-of-contents">back to top</a>)</p>

## Acknowledgments

-   [Nodemailer](https://nodemailer.com/) for seamless email integration.
-   [Render](https://render.com/) for hassle-free cloud deployment.

<p align="right">(<a href="#table-of-contents">back to top</a>)</p>



## Group Members

**ST10048211 – Anjali Sunil Morar**

**ST10071160 – Aidan Johann Schwoerer**

**ST10104776 – Mohamad Aslam Mustufa Khalifa**

**ST10243270 – Aayush Navsariwala**

**ST10062860 – Abdullah Gadatia**

<p align="right">(<a href="#table-of-contents">back to top</a>)</p>

## License

This project is licensed under the MIT License.
<p align="right">(<a href="#table-of-contents">back to top</a>)</p>



## Future Enhancements

-   Implement real OTP verification using services like Twilio.
-   Add user roles and permissions.
-   Extend API with additional endpoints for user profile management.
-   Add comprehensive error handling and logging.

<p align="right">(<a href="#table-of-contents">back to top</a>)</p>
