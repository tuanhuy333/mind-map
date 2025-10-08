# Supabase Integration Setup Guide

This guide will help you set up Supabase for your MindMap application to enable cloud persistence.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `mindmap-app` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
5. Click "Create new project"
6. Wait for the project to be set up (this may take a few minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Replace the placeholder values with your actual Supabase credentials.

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `database-schema.sql` from your project
4. Click "Run" to execute the SQL

This will create:
- The `mindmaps` table with proper structure
- Indexes for better performance
- Row Level Security (RLS) policies
- Automatic timestamp updates

## Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your app in the browser
3. Try creating a new mindmap
4. Check your Supabase dashboard → **Table Editor** → **mindmaps** to see if data is being saved

## Features Enabled

With Supabase integration, your app now has:

- ✅ **Cloud Persistence**: Mindmaps are saved to the cloud
- ✅ **Real-time Sync**: Changes are automatically saved
- ✅ **Offline Fallback**: Falls back to localStorage if Supabase is unavailable
- ✅ **Error Handling**: Graceful error handling with retry options
- ✅ **Loading States**: Visual feedback during save/load operations
- ✅ **Search**: Full-text search capabilities (via database indexes)

## Troubleshooting

### "Supabase credentials not found" warning
- Make sure your `.env.local` file exists and has the correct variable names
- Restart your development server after adding environment variables

### Data not saving
- Check your Supabase project is active (not paused)
- Verify your API keys are correct
- Check the browser console for error messages

### Database connection issues
- Ensure your Supabase project is not paused
- Check if you have the correct database password
- Verify your region selection

## Security Notes

- The current setup uses Row Level Security (RLS) with open policies for simplicity
- For production, consider implementing user authentication and proper RLS policies
- Never commit your `.env.local` file to version control

## Next Steps

Consider implementing:
- User authentication with Supabase Auth
- User-specific mindmaps with proper RLS policies
- Real-time collaboration features
- File attachments for mindmaps
- Export/import functionality

## Support

If you encounter issues:
1. Check the Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
2. Review the browser console for error messages
3. Check the Supabase dashboard logs for server-side errors
