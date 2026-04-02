import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const uploadDir = './public/projects';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

const projectUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'beforeImage', maxCount: 10 },
  { name: 'afterImage', maxCount: 10 }
]);

let projects = [
  { 
    id: 1, 
    title: 'Neural Interface', 
    type: 'UI/UX Design',
    sole: 'Custom Rubber',
    brand: 'MODRN',
    description: 'A futuristic dashboard for biometric monitoring systems.', 
    challenge: 'Designing a complex data visualization system that remains intuitive for high-stress environments.',
    solution: 'Implemented a modular grid system with customizable widgets and AI-driven priority alerts.',
    results: '40% reduction in response time for critical biometric alerts during testing.',
    image: '/projects/image-1774790243689-540629400.jpeg', 
    beforeImages: ['/projects/image-1774790243689-540629400.jpeg'],
    afterImages: [],
    link: '#'
  },
  { 
    id: 2, 
    title: 'Skyline Analytics', 
    type: 'Web Development',
    sole: 'Vibram',
    brand: 'TechCity',
    description: 'Real-time data visualization platform for urban planning.', 
    challenge: 'Processing and rendering massive datasets of city traffic and energy usage in real-time.',
    solution: 'Built a custom WebGL-based rendering engine and optimized data streams using WebSockets.',
    results: 'Achieved 60fps rendering of over 100,000 data points concurrently.',
    image: '/projects/image-1774790437599-888487265.jpeg', 
    beforeImages: ['/projects/image-1774790437599-888487265.jpeg'],
    afterImages: [],
    link: '#'
  }
];

app.get('/', (req, res) => {
  res.send('<h1>MODRN Backend is running</h1><p>API endpoint: <a href="/api/projects">/api/projects</a></p>');
});

app.get('/api/projects', (req, res) => res.json(projects));

app.get('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  project ? res.json(project) : res.status(404).json({ message: 'Not found' });
});

app.post('/api/projects', (req, res) => {
  projectUpload(req, res, (err) => {
    if (err) return res.status(400).json({ message: 'Upload error', error: err.message });

    const { title, type, sole, brand, description, challenge, solution, results, link } = req.body;
    
    const getFilePath = (fieldname) => {
      if (!req.files || !req.files[fieldname]) return null;
      return `/projects/${req.files[fieldname][0].filename}`;
    };

    const newProject = {
      id: Date.now(),
      title: title || 'Untitled Project',
      type: type || 'None',
      sole: sole || 'None',
      brand: brand || 'None',
      description: description || '',
      challenge: challenge || '',
      solution: solution || '',
      results: results || '',
      image: '/projects/placeholder.jpg',
      beforeImages: [],
      afterImages: [],
      link: link || '#'
    };

    if (req.files['beforeImage']) {
      req.files['beforeImage'].forEach(file => newProject.beforeImages.push(`/projects/${file.filename}`));
    }
    if (req.files['afterImage']) {
      req.files['afterImage'].forEach(file => newProject.afterImages.push(`/projects/${file.filename}`));
    }

    if (newProject.beforeImages.length > 0) {
      newProject.image = newProject.beforeImages[0];
    } else {
      newProject.image = getFilePath('image') || '/projects/placeholder.jpg';
    }

    projects.push(newProject);
    res.status(201).json(newProject);
  });
});

app.post('/api/projects/:id/images', (req, res) => {
  projectUpload(req, res, (err) => {
    if (err) return res.status(400).json({ message: 'Upload error', error: err.message });

    const id = parseInt(req.params.id);
    const project = projects.find(p => p.id === id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.files['image']) {
      project.image = `/projects/${req.files['image'][0].filename}`;
    }

    if (req.files['beforeImage']) {
      req.files['beforeImage'].forEach(file => {
        project.beforeImages.push(`/projects/${file.filename}`);
      });
    }

    if (req.files['afterImage']) {
      req.files['afterImage'].forEach(file => {
        project.afterImages.push(`/projects/${file.filename}`);
      });
    }

    if ((!project.image || project.image === '/projects/placeholder.jpg' || project.image === 'None') && project.beforeImages.length > 0) {
      project.image = project.beforeImages[0];
    }

    res.json(project);
  });
});

// Unified PATCH route for any project field
app.patch('/api/projects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const project = projects.find(p => p.id === id);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const updates = req.body;
  const allowedUpdates = ['title', 'description', 'challenge', 'solution', 'results', 'type', 'sole', 'brand', 'link'];
  
  Object.keys(updates).forEach(key => {
    if (allowedUpdates.includes(key)) {
      project[key] = updates[key];
    }
  });
  
  res.json(project);
});

app.delete('/api/projects/:id/images', (req, res) => {
  const { type, url } = req.body;
  const id = parseInt(req.params.id);
  const project = projects.find(p => p.id === id);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  if (type === 'before') {
    project.beforeImages = project.beforeImages.filter(img => img !== url);
  } else if (type === 'after') {
    project.afterImages = project.afterImages.filter(img => img !== url);
  }

  if (project.beforeImages.length > 0) {
    project.image = project.beforeImages[0];
  } else if (type === 'before') {
    project.image = '/projects/placeholder.jpg';
  }

  res.json(project);
});

app.delete('/api/projects/:id', (req, res) => {
  projects = projects.filter(p => p.id !== parseInt(req.params.id));
  res.status(200).json({ message: 'Deleted' });
});

app.listen(port, () => console.log(`Backend running at http://localhost:${port}`));
