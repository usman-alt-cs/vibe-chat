# VibeChat

VibeChat is a minimal, secure, mobile-first one-to-one text and emoji chat app.
It features a premium Apple liquid-glass-inspired UI.

## Prerequisites
- Node.js (v18+ recommended)
- npm

## Installation & Setup

1. **Install Server Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Run Backend Server**
   ```bash
   npm run dev
   # OR
   node server.js
   ```
   *The server runs on http://localhost:3000. It uses SQLite which will automatically be created in the `database` folder.*

3. **Install Client Dependencies**
   ```bash
   cd client
   npm install
   ```

4. **Run Ionic Frontend**
   ```bash
   ionic serve
   ```
   *The frontend runs on http://localhost:8100.*

5. **Build Frontend**
   ```bash
   ionic build
   ```

## Testing / Demo Credentials
To test the app, you can easily sign up a new user from the UI.
For example:
- **User 1**:
  - Name: Alice
  - Username: alice123
  - Email: alice@example.com
  - Password: password123
- **User 2**:
  - Name: Bob
  - Username: bob456
  - Email: bob@example.com
  - Password: password123

1. Create these users on the `/signup` page.
2. Login with Alice.
3. Search for "bob" in the Home tab and send him a message.
4. Log out (Profile tab).
5. Login with Bob.
6. You will see Alice's message in the recent conversations list. Click it to reply.

## Known Limitations
- The app uses HTTP polling (`setInterval` via RxJS) every 3 seconds for new messages, as real-time WebSockets were excluded from the MVP scope.
- Media (Images, Videos, Audio) and files are not supported.
- Typing indicators and read receipts are not supported.
- Passwords are encrypted via bcrypt, but there is no "Forgot Password" or email validation feature in this MVP.
