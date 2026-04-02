import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'

interface Project {
  id: number
  title: string
  categories: string[]
  description: string
  challenge?: string
  solution?: string
  results?: string
  image: string
  beforeImages: string[]
  afterImages: string[]
  link: string
}

function Header({ onAdmin, onPortal, onContact, scrolled }: any) {
  return (
    <header className={scrolled ? 'glass scrolled' : ''}>
      <div className="container nav-content">
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>MODRN</Link>
        <nav className="nav-links">
          <Link to="/">Work</Link>
          <button className="btn-small glass" onClick={onAdmin}>Add Project</button>
          <button className="btn-small glass" style={{ borderColor: 'var(--primary)' }} onClick={onPortal}>Project Portal</button>
          <button className="btn-small glass" onClick={onContact}>Contact</button>
        </nav>
      </div>
    </header>
  )
}

function ProjectDetail({ projects }: { projects: Project[] }) {
  const { id } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [isEditingCategories, setIsEditingCategories] = useState(false)
  const [editedCategories, setEditedCategories] = useState('')
  const [beforeFiles, setBeforeFiles] = useState<FileList | null>(null)
  const [afterFiles, setAfterFiles] = useState<FileList | null>(null)
  
  const beforeInputRef = useRef<HTMLInputElement>(null)
  const afterInputRef = useRef<HTMLInputElement>(null)
  
  const navigate = useNavigate()

  const fetchProject = () => {
    fetch(`http://localhost:3001/api/projects/${id}`)
      .then(res => res.json())
      .then(data => {
        data.beforeImages = data.beforeImages || []
        data.afterImages = data.afterImages || []
        setProject(data)
        setEditedCategories((data.categories || []).join(', '))
      })
      .catch(err => console.error(err))
  }

  useEffect(() => {
    fetchProject()
    window.scrollTo(0, 0)
  }, [id])

  const handleCategoriesUpdate = async () => {
    try {
      const categoriesArray = editedCategories.split(',').map(t => t.trim()).filter(t => t !== '')
      const res = await fetch(`http://localhost:3001/api/projects/${id}/categories`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: categoriesArray })
      })
      if (res.ok) {
        setIsEditingCategories(false)
        fetchProject()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleImageUpload = async (type: 'before' | 'after') => {
    const files = type === 'before' ? beforeFiles : afterFiles
    if (!files || files.length === 0) {
      alert("Please select images first.")
      return
    }
    
    const data = new FormData()
    const fieldName = type === 'before' ? 'beforeImage' : 'afterImage'
    
    Array.from(files).forEach(file => {
      data.append(fieldName, file)
    })

    try {
      const res = await fetch(`http://localhost:3001/api/projects/${id}/images`, {
        method: 'POST',
        body: data
      })

      if (res.ok) {
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} photos added successfully!`)
        if (type === 'before') {
          setBeforeFiles(null)
          if (beforeInputRef.current) beforeInputRef.current.value = ''
        } else {
          setAfterFiles(null)
          if (afterInputRef.current) afterInputRef.current.value = ''
        }
        fetchProject()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const deleteImage = async (type: 'before' | 'after', url: string) => {
    if (!confirm("Remove this image?")) return
    
    try {
      const res = await fetch(`http://localhost:3001/api/projects/${id}/images`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, url })
      })
      if (res.ok) fetchProject()
    } catch (err) {
      console.error(err)
    }
  }

  if (!project) return <div className="container" style={{ marginTop: '150px' }}>Loading...</div>

  const moreProjects = (projects || []).filter(p => p.id !== project.id).slice(0, 3)

  return (
    <div className="container" style={{ marginTop: '150px', paddingBottom: '100px' }}>
      <button onClick={() => navigate('/')} className="view-link" style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: '40px' }}>← Back to Projects</button>
      
      <div className="glass" style={{ padding: '60px', borderRadius: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px', alignItems: 'center', marginBottom: '80px' }}>
          <img src={project.image} alt={project.title} style={{ width: '100%', borderRadius: '24px', boxShadow: 'var(--shadow)' }} />
          <div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
              {isEditingCategories ? (
                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                  <input 
                    type="text" 
                    className="glass-input" 
                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                    value={editedCategories}
                    onChange={(e) => setEditedCategories(e.target.value)}
                    placeholder="Enter categories separated by commas"
                  />
                  <button className="btn-small glass" onClick={handleCategoriesUpdate}>Save</button>
                  <button className="btn-small glass" onClick={() => setIsEditingCategories(false)}>Cancel</button>
                </div>
              ) : (
                <>
                  {(project.categories || []).map(cat => (
                    <span key={cat} className="badge glass" style={{ marginBottom: '0' }}>{cat}</span>
                  ))}
                  <button 
                    onClick={() => setIsEditingCategories(true)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                  >Edit Categories</button>
                </>
              )}
            </div>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '24px', letterSpacing: '-2px' }}>{project.title}</h1>
            <p className="project-desc" style={{ fontSize: '1.2rem' }}>{project.description}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginBottom: '80px' }}>
          {project.challenge && (
            <div className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>The Challenge</h3>
              <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>{project.challenge}</p>
            </div>
          )}
          {project.solution && (
            <div className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>The Solution</h3>
              <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>{project.solution}</p>
            </div>
          )}
          {project.results && (
            <div className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>Key Results</h3>
              <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>{project.results}</p>
            </div>
          )}
        </div>

        {/* Before & After Section */}
        <div className="before-after-section glass" style={{ padding: '48px', borderRadius: '24px', border: '1px solid var(--primary)' }}>
          <h2 style={{ marginBottom: '40px', textAlign: 'center', fontSize: '2.5rem' }}>Before & After</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
            {/* Before Gallery */}
            <div>
              <span className="badge glass" style={{ marginBottom: '16px', borderColor: 'var(--accent)' }}>Before</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '24px' }}>
                {(project.beforeImages || []).length > 0 ? project.beforeImages.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <img src={img} alt={`Before ${idx}`} style={{ width: '100%', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }} />
                    <button 
                      onClick={() => deleteImage('before', img)}
                      style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(244, 63, 94, 0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold' }}
                    >×</button>
                  </div>
                )) : <div className="glass" style={{ height: '100px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No Before Images</div>}
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Add Before Photos</label>
                <input 
                  type="file" 
                  multiple 
                  ref={beforeInputRef}
                  className="glass-input" 
                  onChange={e => setBeforeFiles(e.target.files)} 
                />
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
                  onClick={() => handleImageUpload('before')}
                  disabled={!beforeFiles}
                >Upload Before Photos</button>
              </div>
            </div>

            {/* After Gallery */}
            <div>
              <span className="badge glass" style={{ marginBottom: '16px', borderColor: '#10b981' }}>After</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '24px' }}>
                {(project.afterImages || []).length > 0 ? project.afterImages.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <img src={img} alt={`After ${idx}`} style={{ width: '100%', borderRadius: '16px', border: '1px solid var(--primary)' }} />
                    <button 
                      onClick={() => deleteImage('after', img)}
                      style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(244, 63, 94, 0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold' }}
                    >×</button>
                  </div>
                )) : <div className="glass" style={{ height: '100px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No After Images</div>}
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Add After Photos</label>
                <input 
                  type="file" 
                  multiple 
                  ref={afterInputRef}
                  className="glass-input" 
                  onChange={e => setAfterFiles(e.target.files)} 
                />
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
                  onClick={() => handleImageUpload('after')}
                  disabled={!afterFiles}
                >Upload After Photos</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* More Projects */}
      {moreProjects.length > 0 && (
        <section style={{ marginTop: '120px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '60px', textAlign: 'center' }}>More Selected Works</h2>
          <div className="products-grid">
            {moreProjects.map(p => (
              <div key={p.id} className="product-card glass">
                <div className="product-image">
                  <img src={p.image} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }} />
                </div>
                <h3 className="product-name">{p.title}</h3>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {(p.categories || []).map(cat => (
                    <span key={cat} style={{ color: '#64748b', fontSize: '0.8rem', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: '4px' }}>{cat}</span>
                  ))}
                </div>
                <Link to={`/project/${p.id}`} className="view-link">View Case Study →</Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Home({ projects }: { projects: Project[] }) {
  const [activeCategory, setActiveCategory] = useState('All')
  
  // Flatten all categories from all projects and get unique values
  const projectsList = Array.isArray(projects) ? projects : []
  
  const allCategories = projectsList.reduce((acc: string[], project) => {
    const projectCats = Array.isArray(project.categories) ? project.categories : []
    return [...acc, ...projectCats]
  }, [])
  
  const categories = ['All', ...new Set(allCategories.filter(cat => typeof cat === 'string' && cat.trim() !== ''))]
  
  // Filter projects if their categories array contains the activeCategory
  const filteredProjects = activeCategory === 'All' 
    ? projectsList 
    : projectsList.filter(p => Array.isArray(p.categories) && p.categories.includes(activeCategory))

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <span className="badge glass">Product Designer & Engineer</span>
          <h1>Design for the <br/> digital era.</h1>
          <p>I build precision-engineered interfaces and high-performance applications.</p>
          <button className="btn-primary" onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })}>View Projects</button>
        </div>
      </section>

      <section id="work" className="products-section container">
        <h2 className="section-title">Selected Works</h2>
        
        {categories.length > 1 && (
          <div className="filter-container">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`filter-tag ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="products-grid">
          {filteredProjects.map(p => (
            <div key={p.id} className="product-card glass">
              <div className="product-image">
                <img src={p.image} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }} />
              </div>
              <h3 className="product-name">{p.title}</h3>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {(p.categories || []).map(cat => (
                  <span key={cat} style={{ color: '#64748b', fontSize: '0.8rem', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: '4px' }}>{cat}</span>
                ))}
              </div>
              <Link to={`/project/${p.id}`} className="view-link">View Case Study →</Link>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [isPortalOpen, setIsPortalOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  const [newProject, setNewProject] = useState({ title: '', categories: '', description: '', challenge: '', solution: '', results: '', link: '' })
  const [files, setFiles] = useState<{ image: File | null, before: File | null, after: File | null }>({ image: null, before: null, after: null })

  const fetchProjects = () => {
    fetch('http://localhost:3001/api/projects')
      .then(res => res.json())
      .then(setProjects)
      .catch(err => console.error("Error fetching projects:", err))
  }

  useEffect(() => {
    fetchProjects()
    window.addEventListener('scroll', () => setScrolled(window.scrollY > 50))
  }, [])

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = new FormData()
      Object.entries(newProject).forEach(([k, v]) => data.append(k, v))
      if (files.image) data.append('image', files.image)
      if (files.before) data.append('beforeImage', files.before)
      if (files.after) data.append('afterImage', files.after)

      console.log('Submitting data...')
      const res = await fetch('http://localhost:3001/api/projects', { method: 'POST', body: data })
      
      if (res.ok) {
        setIsAdminOpen(false)
        fetchProjects()
        alert("Project added with categories!")
      } else {
        const errorData = await res.json()
        console.error('Server error:', errorData)
        alert(`Failed to add project: ${errorData.message || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Fetch error:', err)
      alert('Could not connect to server. Ensure the backend is running at http://localhost:3001')
    }
  }

  return (
    <Router>
      <Header onAdmin={() => setIsAdminOpen(true)} onPortal={() => setIsPortalOpen(true)} onContact={() => setIsContactOpen(true)} scrolled={scrolled} />
      
      <Routes>
        <Route path="/" element={<Home projects={projects} />} />
        <Route path="/project/:id" element={<ProjectDetail projects={projects} />} />
      </Routes>

      {/* Admin Drawer with Categories */}
      <div className={`cart-overlay ${(isAdminOpen || isPortalOpen || isContactOpen) ? 'open' : ''}`} onClick={() => { setIsAdminOpen(false); setIsPortalOpen(false); setIsContactOpen(false); }} />
      <div className={`cart-drawer glass ${isAdminOpen ? 'open' : ''}`}>
        <div className="cart-header"><h2>Add Project</h2><button onClick={() => setIsAdminOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px' }}>×</button></div>
        <form className="contact-form" onSubmit={handleProjectSubmit} style={{ overflowY: 'auto', paddingRight: '12px', flex: 1 }}>
          <div className="form-group"><label>Title</label><input type="text" className="glass-input" required onChange={e => setNewProject({...newProject, title: e.target.value})} /></div>
          <div className="form-group"><label>Categories (Comma separated)</label><input type="text" className="glass-input" placeholder="e.g. Category 1, Category 2, Category 3" required onChange={e => setNewProject({...newProject, categories: e.target.value})} /></div>
          <div className="form-group"><label>Overview</label><textarea className="glass-input" required onChange={e => setNewProject({...newProject, description: e.target.value})} /></div>
          
          <div className="form-group"><label>The Challenge</label><textarea className="glass-input" placeholder="What problem were you solving?" onChange={e => setNewProject({...newProject, challenge: e.target.value})} /></div>
          <div className="form-group"><label>The Solution</label><textarea className="glass-input" placeholder="How did you solve it?" onChange={e => setNewProject({...newProject, solution: e.target.value})} /></div>
          <div className="form-group"><label>Key Results</label><textarea className="glass-input" placeholder="What were the outcomes?" onChange={e => setNewProject({...newProject, results: e.target.value})} /></div>

          <div className="form-group"><label>Main Image</label><input type="file" className="glass-input" onChange={e => setFiles({...files, image: e.target.files?.[0] || null})} /></div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group"><label>Before Image</label><input type="file" className="glass-input" onChange={e => setFiles({...files, before: e.target.files?.[0] || null})} /></div>
            <div className="form-group"><label>After Image</label><input type="file" className="glass-input" onChange={e => setFiles({...files, after: e.target.files?.[0] || null})} /></div>
          </div>
          
          <div style={{ height: '20px' }}></div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '40px' }}>Upload Project</button>
        </form>
      </div>

      <div className={`cart-drawer glass ${isPortalOpen ? 'open' : ''}`} style={{ maxWidth: '600px', right: isPortalOpen ? '0' : '-620px' }}>
        <div className="cart-header"><h2>Portal</h2><button onClick={() => setIsPortalOpen(false)} style={{ background: 'none', border: 'none', color: 'white' }}>×</button></div>
        <div className="portal-content" style={{ overflowY: 'auto', flex: 1 }}>
          {(projects || []).map(p => (
            <div key={p.id} className="portal-item glass" style={{ padding: '16px', borderRadius: '16px', marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <img src={p.image} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}><h4>{p.title}</h4></div>
              <button onClick={async () => { if(confirm("Delete?")) { await fetch(`http://localhost:3001/api/projects/${p.id}`, { method: 'DELETE' }); fetchProjects(); } }} style={{ background: 'rgba(244, 63, 94, 0.1)', border: 'none', color: '#f43f5e', padding: '8px 12px', borderRadius: '8px' }}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </Router>
  )
}

export default App
