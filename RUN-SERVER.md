# How to Run the Server

## Step 1: Open PowerShell in the project directory

Navigate to: `C:\Users\sharm\Downloads\telecom_customer_churn_prediction_system`

## Step 2: Set Execution Policy (if needed)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

## Step 3: Install Dependencies (if not already installed)

```powershell
npm install
```

## Step 4: Start Convex Backend First

```powershell
npx convex dev
```

This will:
- Ask you to log in to Convex (if not already logged in)
- Generate the `.env.local` file with `VITE_CONVEX_URL`
- Start the Convex backend server

**Keep this terminal window open!**

## Step 5: Open a NEW PowerShell Window

In the new window, navigate to the project directory and run:

```powershell
npm run dev:frontend
```

OR use the script:

```powershell
.\start-server.ps1
```

## Step 6: Access the App

Open your browser and go to: `http://localhost:5173`

## Troubleshooting

If you see errors:
1. Make sure `.env.local` file exists and has `VITE_CONVEX_URL`
2. Make sure Convex backend is running (Step 4)
3. Check that port 5173 is not in use by another application
4. Try running `npx convex dev` separately first, then start the frontend

