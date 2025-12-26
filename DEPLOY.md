# How to Deploy Termin

Termin is ready for production. Since it uses Firebase (Firestore + Auth + Hosting), deployment is streamlined.

## Prerequisites
- Node.js installed.
- A Firebase Project created (which you already have: `termin-15`).

## Step 1: Install Firebase CLI
Open a terminal and run:
```bash
npm install -g firebase-tools
```

## Step 2: Login & Init
```bash
firebase login
firebase init hosting
```
- Select your project: `termin-15`
- Public directory: `.` (Current directory)
- Configure as single-page app? **No**
- Overwrite index.html? **No**

## Step 3: Deploy Rules
```bash
firebase deploy --only firestore:rules
```
This uploads the secure `firestore.rules` file we created.

## Step 4: Deploy Website
```bash
firebase deploy --only hosting
```

Your app will be live at `https://termin-15.web.app`!

## Post-Launch Checklist
1.  **EmailJS**: Ensure your EmailJS account is active and the Public Key in `assets/js/email.js` and `booking/book.html` is valid.
2.  **Admin Account**: Ensure you have created your admin account via `auth/signup.html` (then you can delete that file or secure it so no one else signs up).
