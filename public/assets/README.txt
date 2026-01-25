ASSETS FOLDER - Store your images and static files here

📁 Folder Structure:
  images/  - Logo, mockups, screenshots, feature images
  icons/   - Favicon, app icons

🖼️ How to Use in Your Components:

  import Image from 'next/image'
  
  <Image 
    src="/assets/images/logo.svg" 
    alt="Logo" 
    width={200} 
    height={50} 
  />

📌 Recommended Files to Add:

  ✓ logo.svg or logo.png        → Your main logo
  ✓ hero-mockup.png             → Tool interface preview for Hero section
  ✓ demo-screenshot.png         → Screenshots for Demo page
  ✓ favicon.ico (in public/)    → Browser tab icon

Note: All files in public/ are served from the root URL path.
Example: public/assets/images/logo.svg becomes /assets/images/logo.svg
