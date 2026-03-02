Design a modern, minimal mobile app UI for a product called “EduCore”.

The app helps tuition teachers track student fee payments, pending dues, and monthly collections.

Style inspiration:

Clean card-based layout

Soft blue → teal gradient accents

Rounded corners (12–16px)

Financial dashboard clarity

Similar aesthetic to modern fintech dashboards

Minimal decoration, high usability

Create complete mobile screens (iPhone 14 frame size) in both Light Mode and Dark Mode using design tokens and reusable components.

🎨 DESIGN SYSTEM REQUIREMENTS

Use a consistent design system:

Colors (Light Mode)

Background: very light gray (#F7F9FC)

Cards: white

Primary accent: blue-teal gradient

Text primary: near black

Success: green

Warning: amber

Error: red

Colors (Dark Mode)

Background: dark navy (#0F172A)

Cards: dark slate

Text primary: off-white

Keep same accent gradient adapted for dark

Typography

Clear hierarchy:

H1 (large summary numbers)

H2 (section headers)

Body text

Small caption

Use clean modern font (Inter / SF Pro style)

Components (Reusable)

Primary button (gradient)

Secondary button

Status badges (Paid / Partial / Pending)

Stat cards

Student list item

Input field

Bottom navigation bar

Modal bottom sheet

Toggle switch (for dark mode)

📱 SCREENS TO CREATE
1️⃣ Splash / Onboarding Screen

Layout:

Top: Illustration (education + money concept)

Center:

Title: “Collect Fees With Ease”

Subtitle: “Track payments and manage dues effortlessly.”

Bottom:

Primary CTA: Get Started

Secondary: Login

Minimal and welcoming.

2️⃣ Signup Screen

Layout:

App logo at top

Input fields:

Name

Email

Password

Confirm Password

Primary button: Create Account

Link: Already have account?

Include:

Inline validation error state

Disabled button state

3️⃣ Login Screen

Layout:

Email

Password

Login button

Forgot password (subtle)

Include:

Error state (invalid credentials)

4️⃣ Dashboard (Home Screen)

This is the primary screen.

Layout hierarchy:

Top bar:

Greeting (“Hello, Zahid 👋”)

Month selector

Notification icon

Section 1:
Large Monthly Progress Card:

Amount collected

Target amount

Progress bar

Section 2:
Stat cards:

Active Students

Total Expected

Total Pending

Section 3:
Students with Pending Fees (top 5 list)
Each row:

Name

Fee amount

Status badge

Quick “Collect” button

Section 4:
Recent Activity list

Bottom Navigation:

Home

Students

Summary

Profile

5️⃣ Student List Screen

Layout:

Search bar

Filter chips:

All

Paid

Partial

Pending

Student list items:

Avatar circle (initial)

Student name

Monthly fee

Due date

Status badge

Floating Action Button:

Add Student

Include:

Empty state (No students yet illustration)

Loading skeleton state

6️⃣ Add / Edit Student Screen

Form layout:

Student Name

Parent Name

Parent Phone

Monthly Fee

Due Day picker

Active toggle

Sticky bottom:

Save button

Include:

Error validation state

Disabled save state

7️⃣ Student Profile Screen

Layout:

Top:

Student name

Status indicator

Section 1:
Fee overview card:

Monthly Fee

Current Month Status

Outstanding Amount

Section 2:
Month-wise breakdown list
Each row:

Month

Expected

Paid

Status badge

Sticky bottom:

Collect Payment button

Include:

Empty payment state

8️⃣ Record Payment (Bottom Sheet Modal)

Fields:

Month dropdown

Year selector

Amount Paid

Date (default today)

Display:

Remaining amount preview (dynamic)

Primary CTA:
Confirm Payment

Include:

Error state

Partial payment scenario UI

9️⃣ Monthly Summary Screen

Layout:

Month selector

Three large stat cards:

Total Expected

Total Collected

Total Pending

List below:
Students + status

Minimal, no charts.

🔟 Profile Screen

Layout:

User info card

Dark Mode toggle

Logout button

Minimal settings only.

🌗 DARK MODE REQUIREMENT

Create duplicate variants of key screens in dark mode using:

Proper contrast

Adjusted shadows

Same layout structure

Use component variants for:

Light/Dark

Status types

Button states

⚙️ INTERACTION STATES TO INCLUDE

Hover (if applicable)

Pressed button

Disabled button

Input error

Loading state (skeleton)

Empty state

Success confirmation (small toast)

🧠 DESIGN PRINCIPLES TO FOLLOW

Financial clarity first

Avoid decorative clutter

Large readable numbers

Clear visual hierarchy

Minimum 16px spacing grid

Touch-friendly tap targets (44px+)

Accessibility contrast compliance