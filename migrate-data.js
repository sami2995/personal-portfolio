const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'portfolio.db');
const db = new sqlite3.Database(dbPath);

// Default portfolio data (from your original HTML)
const defaultData = {
  about: [
    "Hello! I'm Samiyas Solomon, a Computer Science student passionate about coding with a strong interest in web development.",
    "Beyond coding, I enjoy reading tech blogs, experimenting with new tools, and contributing to open-source projects.",
    "My goal is to continuously grow as a developer and make a positive impact in the tech world."
  ],
  skills: {
    frontend: ["HTML", "CSS", "JavaScript", "React"],
    backend: ["Node.js", "Express.js", "Django", "PHP"],
    tools: ["SQL", "PostgreSQL", "MongoDB", "Git", "GitHub", "VS Code"]
  },
  projects: [
    {
      title: "Netflix Clone",
      description: "Clone of Netflix website.",
      image: "image/net.png",
      link: "https://ui-demo-inky.vercel.app/",
      link_label: "Visit Site"
    },
    {
      title: "Google Meet Landing Page Clone",
      description: "A clone of the Google Meet landing page with responsive design.",
      image: "image/Screenshot.png",
      link: "https://sami2995.github.io/googlemeetclone/googleclone.html",
      link_label: "Visit Site"
    },
    {
      title: "Blog post app",
      description: "A full stack blog post app where users can add blogs, edit and delete.",
      image: "image/blog.png",
      link: "https://blog-post-app-alpha.vercel.app/",
      link_label: "Visit Site"
    },
    {
      title: "Apple clone",
      description: "An Apple UI clone created using React components.",
      image: "image/apple.png",
      link: "https://apple-clone-eight-topaz.vercel.app/",
      link_label: "Visit Site"
    },
    {
      title: "Youtube API integration",
      description: "Integrated YouTube API where users can search and watch YouTube videos.",
      image: "image/yt.png",
      link: "https://youtube-latest-videos.vercel.app/",
      link_label: "Visit Site"
    },
    {
      title: "ACT website Clone",
      description: "Clone of AMERICAN COLLEGE OF TECHNOLOGY website.",
      image: "image/act.png",
      link: "https://sami2995.github.io/ACT-website/",
      link_label: "Visit Site"
    },
    {
      title: "Library Management System",
      description: "A simple library for borrowing and returning books fully built using PHP.",
      image: "image/library.png",
      link: "",
      link_label: ""
    },
    {
      title: "Digital menu",
      description: "A digital menu website where users can explore menus.",
      image: "image/menu.png",
      link: "https://digital-menu-azure.vercel.app/",
      link_label: "Visit Site"
    },
    {
      title: "Ecommerce site",
      description: "An ecommerce website where users can explore items.",
      image: "image/ecom.png",
      link: "https://ecommerce-five-ruby-17.vercel.app/",
      link_label: "Visit Site"
    }
  ]
};

db.serialize(() => {
  console.log('Starting data migration...');

  // Insert about data
  db.run(
    'INSERT OR REPLACE INTO portfolio_data (section, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
    ['about', JSON.stringify(defaultData.about)],
    function(err) {
      if (err) {
        console.error('Error inserting about data:', err.message);
      } else {
        console.log('✓ About data migrated');
      }
    }
  );

  // Insert skills data
  db.run(
    'INSERT OR REPLACE INTO portfolio_data (section, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
    ['skills', JSON.stringify(defaultData.skills)],
    function(err) {
      if (err) {
        console.error('Error inserting skills data:', err.message);
      } else {
        console.log('✓ Skills data migrated');
      }
    }
  );

  // Insert projects
  const stmt = db.prepare('INSERT OR REPLACE INTO projects (title, description, image, link, link_label, display_order) VALUES (?, ?, ?, ?, ?, ?)');
  
  defaultData.projects.forEach((project, index) => {
    stmt.run(
      project.title,
      project.description || '',
      project.image || '',
      project.link || '',
      project.link_label || '',
      index
    );
  });

  stmt.finalize((err) => {
    if (err) {
      console.error('Error inserting projects:', err.message);
    } else {
      console.log(`✓ ${defaultData.projects.length} projects migrated`);
    }

    console.log('\nMigration complete!');
    db.close();
  });
});
