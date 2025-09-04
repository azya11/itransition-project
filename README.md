# Project for my friend

## How to setup a project?

### Step 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### Step 2. Set Up Supabase

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization and create the project

2. **Get Your Supabase Credentials**
   - Go to Project Settings → API
   - Copy your Project URL and anon public key

### Step 3. Environment Variables

Create a `.env.local` file in the root directory:

### Step 4. Database Setup

1. **Open Supabase SQL Editor**
   - Go to your Supabase dashboard
   - Click on "SQL Editor"

2. **Run Database Schema Script**
   - Copy the contents of `sql/first.sql`
   - Paste it in the SQL Editor and click "Run"
   - This creates all necessary tables and RLS policies

3. **Run Profile Trigger Script**
   - Copy the contents of `sql/second.sql`
   - Paste it in the SQL Editor and click "Run"
   - This sets up automatic user profile creation

## Description of a Task

### 1. Technologies & Frameworks

**There are two options:**

-> Using .NET (C#) → with Blazor or MVC. And add JS/TS as needed.
    - I don't have that much time (For now at least, next version would be in .NET)

-> JS/TS → with React + Express
    - I'm sticking more to this plan, because I have not that much time to learn Blazor

-> Must use a CSS framework
    - Bootstrap recommended, but others allowed.
    - I use Tailwind

-> Can choose any database (PostgreSQL, MySQL, SQL Server, MongoDB, etc.)
    - I choose supabase

-> You are free with architecture (monolith, microservices, client-heavy, server-heavy, etc.).

-> React is required for JS projects, optional for .NET.

###  2. General Goal

Build a web application for inventory management (like for office equipment, library books, HR documents, etc.).

Main ideas:
    - Inventories = templates (sets of fields).
    - Items = actual entries that fill those fields.
    - Must support custom fields and custom inventory numbers (IDs).

### 3. UI Rules

Avoid cluttered UIs with too many [Edit][Delete] buttons in tables -> instead use toolbars, context menus, checkboxes, or animated actions.

Every page must have a search bar in the header.

Tables are the default way to show inventories and items (you can add other views, but not replace tables).

### 4. User Roles & Permissions

Guests (non-authenticated users):
    - Can search and view inventories/items.
    - Cannot create, edit, comment, like, or add items.

Authenticated users:
    - Can create inventories, comment, like, and add items.

Creators (owners)
    - Define inventory fields, titles, access rights, and ID formats.
    - Can make inventories public (writeable by everyone) or private (restricted to selected users).

Admins:
    - Can do everything the owner can.
    - Can manage users (block/unblock, promote/demote, delete).
    - Can even remove admin rights from themselves.

### 5. User Pages

Every user has:
    - A table of inventories they own (create/edit/delete).
    - A table of inventories they have access to.

### 6. Inventory Pages

Each inventory page has multiple tabs:
    - Table of items (clickable to edit items).
    - Discussion section (real-time or near real-time updates).
    - General settings (title, description in Markdown, category, tags, optional image).
    - Custom inventory numbers (IDs).
    - Access settings (who can add/edit).
    - Fields editor (define custom fields).
    - Statistics (counts, averages, ranges, most common values).

### 7. Features

Custom Inventory IDs
    - Each inventory can define its own unique ID format.

ID can be made of elements:
    - Fixed text, random numbers, GUID, date/time, sequence numbers, etc.

IDs are unique within one inventory, but not across all.

Users can drag, drop, reorder, and format ID elements.

Custom Fields:
    - Each inventory supports custom fields (up to 3 of each type):
        - Single-line text
        - Multi-line text
        - Numeric
        - Document/image (as links)
        - True/false (checkboxes)
        - Each field has:
        - Title
        - Description (tooltip/hint)
    - A flag to show it in tables
    - Fields can be reordered.

Real-Time & Auto-Save:
    - Auto-save for settings every 7–10 seconds (not for items).
    - Real-time updates in discussions.
    - Optimistic locking → prevents conflicts when multiple users edit the same thing.

Search & Tags:
    - Full-text search across everything.
    - Tags with autocomplete and a tag cloud for navigation.

User Interaction
    - Likes (1 per user per item).
    - Discussions with Markdown support.

### 8. UI/UX Requirements

2 languages:
    - English
    - Another

2 themes (light/dark)

Responsive design (desktop + mobile).

Use ORM for DB (Sequelize, Prisma, TypeORM, Entity Framework).

Don’ts:
    - No raw SELECT * full scans.
    - No image uploads to server/DB (use cloud).
    - No DB queries inside loops.
    - No row buttons in tables.