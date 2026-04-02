import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import type { Session } from '@supabase/supabase-js'

interface Project {
  id: number
  title: string
  type: string
  sole: string
  brand: string
  description: string
  challenge?: string
  solution?: string
  results?: string
  image: string
  beforeImages: string[]
  afterImages: string[]
  link: string
}

interface ContactMessage {
  id: number
  name: string
  email: string
  service: string
  message: string
  created_at: string
}

// Feature Flags - Set to true to show header button, false to hide
const SHOW_WORK_BTN = false
const SHOW_CONTACT_BTN = false

// Global Helper to get image URL
const getImageUrl = (path: string) => {
  if (!path) return 'https://via.placeholder.com/800x600?text=No+Image+Available'
  if (path.startsWith('http')) return path
  const { data } = supabase.storage.from('project-assets').getPublicUrl(path)
  return data.publicUrl
}

const getMainImage = (p: Project) => {
  if (!p) return 'https://via.placeholder.com/800x600?text=Loading...'
  let path = ''
  if (p.image && p.image !== '/projects/placeholder.jpg' && p.image !== 'None' && p.image !== '') {
    path = p.image
  } else if (p.beforeImages && p.beforeImages.length > 0) {
    path = p.beforeImages[0]
  }
  return getImageUrl(path)
}

function Header({ onAdmin, onPortal, onContact, scrolled, session, onLogout }: any) {
  return (
    <header className={scrolled ? 'glass scrolled' : ''}>
      <div className="container nav-content" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', width: '100%' }}>
        <div className="nav-left" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/">
            <img src="/logo.png" alt="Logo" style={{ height: '40px', width: 'auto' }} />
          </Link>
          {SHOW_WORK_BTN && (
            <button 
              className="btn-small glass" 
              style={{ color: '#94a3b8' }}
              onClick={() => {
                if (window.location.pathname !== '/') {
                  window.location.href = '/#work'
                } else {
                  document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            >Work</button>
          )}
        </div>

        <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/sole-lab-logo white.png" alt="Sole Lab" style={{ height: '50px', width: 'auto' }} />
        </Link>

        <nav className="nav-links" style={{ justifyContent: 'flex-end', display: 'flex', gap: '12px' }}>
          {session && (
            <>
              <button className="btn-small glass" onClick={onAdmin}>Add Project</button>
              <button className="btn-small glass" style={{ borderColor: 'var(--primary)' }} onClick={onPortal}>Project Portal</button>
            </>
          )}

          {SHOW_CONTACT_BTN && (
            <button className="btn-small glass" onClick={onContact}>Contact</button>
          )}
          
          {session ? (
            <button className="btn-small glass" style={{ color: 'var(--accent)' }} onClick={onLogout}>Logout</button>
          ) : (
            <Link to="/login" className="btn-small glass" style={{ textDecoration: 'none' }}>Login</Link>
          )}
        </nav>
      </div>
    </header>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert(error.message)
    } else {
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="container" style={{ marginTop: '150px', display: 'flex', justifyContent: 'center' }}>
      <div className="glass" style={{ padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>Admin Login</h2>
        <form onSubmit={handleLogin} className="contact-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="glass-input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="glass-input" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

function FormDropdown({ label, options, value, onChange, placeholder }: any) {
  const [isOpen, setIsOpen] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="form-group" style={{ position: 'relative' }} ref={dropdownRef}>
      <label>{label}</label>
      <div 
        className="glass-input" 
        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '50px' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: value ? 'white' : '#64748b' }}>{value || placeholder}</span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.3s', fontSize: '0.8rem' }}>▼</span>
      </div>
      
      {isOpen && (
        <div className="dropdown-menu" style={{ top: '100%', marginTop: '8px', width: '100%', position: 'absolute' }}>
          {options.map((opt: string) => (
            <div key={opt} className={`dropdown-item ${value === opt ? 'selected' : ''}`} onClick={() => { onChange(opt); setIsOpen(false); }}>{opt}</div>
          ))}
          <div style={{ padding: '8px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '8px' }}>
            <input className="glass-input" style={{ padding: '8px', fontSize: '0.9rem', flex: 1 }} placeholder="+ New..." value={customValue} onChange={e => setCustomValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && customValue.trim()) { e.preventDefault(); onChange(customValue.trim()); setCustomValue(''); setIsOpen(false); }}} onClick={e => e.stopPropagation()} />
            <button className="btn-small glass" style={{ padding: '8px 12px' }} onClick={(e) => { e.stopPropagation(); if (customValue.trim()) { onChange(customValue.trim()); setCustomValue(''); setIsOpen(false); }}}>Add</button>
          </div>
        </div>
      )}
    </div>
  )
}

function ProjectDetail({ projects, onUpdate, session }: { projects: Project[], onUpdate: () => void, session: Session | null }) {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const currentId = project?.id || params.id

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ title: '', desc: '', type: '', sole: '', brand: '', challenge: '', solution: '', results: '' })
  const [pendingMainImage, setPendingMainImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const [beforeFiles, setBeforeFiles] = useState<FileList | null>(null)
  const [afterFiles, setAfterFiles] = useState<FileList | null>(null)
  const beforeInputRef = useRef<HTMLInputElement>(null)
  const afterInputRef = useRef<HTMLInputElement>(null)
  
  const navigate = useNavigate()

  const existingTypes = [...new Set((projects || []).map(p => p.type))].filter(Boolean)
  const existingSoles = [...new Set((projects || []).map(p => p.sole))].filter(Boolean)
  const existingBrands = [...new Set((projects || []).map(p => p.brand))].filter(Boolean)

  const fetchProject = async () => {
    if (!params.id) return
    const { data } = await supabase.from('projects').select('*').eq('id', params.id).single()
    if (data) {
      setProject(data)
      setEditData({
        title: data.title || '', desc: data.description || '', type: data.type || '',
        sole: data.sole || '', brand: data.brand || '', challenge: data.challenge || '',
        solution: data.solution || '', results: data.results || ''
      })
    }
  }

  useEffect(() => { fetchProject(); window.scrollTo(0, 0) }, [params.id])

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const { error } = await supabase.storage.from('project-assets').upload(fileName, file)
    if (error) throw error
    return fileName
  }

  const handleSave = async () => {
    if (!currentId) return
    try {
      let mainImagePath = project?.image
      if (pendingMainImage) mainImagePath = await uploadFile(pendingMainImage)

      const { error } = await supabase.from('projects').update({
        title: editData.title, description: editData.desc, type: editData.type,
        sole: editData.sole, brand: editData.brand, challenge: editData.challenge,
        solution: editData.solution, results: editData.results, image: mainImagePath
      }).eq('id', currentId)

      if (error) throw error
      alert("Changes saved!")
      setIsEditing(false); setPendingMainImage(null); setPreviewUrl(null);
      fetchProject(); onUpdate()
    } catch (err: any) { alert(`Save error: ${err.message}`) }
  }

  const handleImageSelect = (file: File) => {
    setPendingMainImage(file); setPreviewUrl(URL.createObjectURL(file))
  }

  const handleImageUpload = async (cat: 'before' | 'after') => {
    if (!currentId || !project) return
    const files = cat === 'before' ? beforeFiles : afterFiles
    if (!files || files.length === 0) return
    try {
      const newPaths = await Promise.all(Array.from(files).map(f => uploadFile(f)))
      const field = cat === 'before' ? 'beforeImages' : 'afterImages'
      const updatedArray = [...(project[field] as string[] || []), ...newPaths]
      const { error } = await supabase.from('projects').update({ [field]: updatedArray }).eq('id', currentId)
      if (error) throw error
      alert("Photos added!")
      if (cat === 'before') { setBeforeFiles(null); if (beforeInputRef.current) beforeInputRef.current.value = '' }
      else { setAfterFiles(null); if (afterInputRef.current) afterInputRef.current.value = '' }
      fetchProject(); onUpdate()
    } catch (err: any) { alert(err.message) }
  }

  const deleteImage = async (type: 'before' | 'after', url: string) => {
    if (!currentId || !project || !confirm("Remove image?")) return
    try {
      const field = type === 'before' ? 'beforeImages' : 'afterImages'
      const updatedArray = (project[field] as string[]).filter(img => img !== url)
      const { error } = await supabase.from('projects').update({ [field]: updatedArray }).eq('id', currentId)
      if (error) throw error
      fetchProject(); onUpdate()
    } catch (err: any) { alert(err.message) }
  }

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    alert("Link copied to clipboard!")
  }

  if (!project) return <div className="container" style={{ marginTop: '150px' }}>Loading...</div>

  const moreProjects = (projects || []).filter(p => p.id !== project.id).slice(0, 3)

  return (
    <div className="container" style={{ marginTop: '150px', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <button onClick={() => navigate('/')} className="view-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>← Back to Projects</button>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn-small glass" style={{ color: 'var(--primary)' }} onClick={handleShare}>Share Project</button>
          {session && (
            !isEditing ? (
              <button className="btn-primary" style={{ padding: '12px 24px' }} onClick={() => setIsEditing(true)}>Edit Project</button>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-primary" style={{ padding: '12px 24px' }} onClick={handleSave}>Save Changes</button>
                <button className="btn-small glass" onClick={() => { setIsEditing(false); setPendingMainImage(null); setPreviewUrl(null); }}>Cancel</button>
              </div>
            )
          )}
        </div>
      </div>
      
      <div className="glass" style={{ padding: '60px', borderRadius: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px', alignItems: 'start', marginBottom: '80px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <img src={previewUrl || getMainImage(project)} alt={project.title} style={{ width: '100%', borderRadius: '24px', boxShadow: 'var(--shadow)' }} />
            {isEditing && (
              <label className="btn-small glass" style={{ position: 'absolute', bottom: '20px', right: '20px', cursor: 'pointer', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                Change Cover Image
                <input type="file" hidden onChange={e => e.target.files?.[0] && handleImageSelect(e.target.files[0])} />
              </label>
            )}
          </div>
          <div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
                  <FormDropdown label="Type" options={existingTypes} value={editData.type} onChange={(val: string) => setEditData({...editData, type: val})} placeholder="Select or type new..." />
                  <FormDropdown label="Sole" options={existingSoles} value={editData.sole} onChange={(val: string) => setEditData({...editData, sole: val})} placeholder="Select or type new..." />
                  <FormDropdown label="Brand" options={existingBrands} value={editData.brand} onChange={(val: string) => setEditData({...editData, brand: val})} placeholder="Select or type new..." />
                </div>
              ) : (
                <>
                  <span className="badge glass" style={{ marginBottom: '0' }}>{project.type}</span>
                  <span className="badge glass" style={{ marginBottom: '0', borderColor: 'var(--accent)' }}>{project.sole}</span>
                  <span className="badge glass" style={{ marginBottom: '0', borderColor: '#10b981' }}>{project.brand}</span>
                </>
              )}
            </div>
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <div className="form-group"><label>Project Title</label><input className="glass-input" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} /></div>
                <div className="form-group"><label>Overview</label><textarea className="glass-input" style={{ height: '120px' }} value={editData.desc} onChange={e => setEditData({...editData, desc: e.target.value})} /></div>
              </div>
            ) : (
              <>
                <h1 style={{ fontSize: '3.5rem', marginBottom: '24px', letterSpacing: '-2px' }}>{project.title}</h1>
                <p className="project-desc" style={{ fontSize: '1.2rem' }}>{project.description}</p>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginBottom: '80px' }}>
          <div className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>Challenge</h3>
            {isEditing ? <textarea className="glass-input" value={editData.challenge} onChange={e => setEditData({...editData, challenge: e.target.value})} /> : <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>{project.challenge || 'No challenge recorded.'}</p>}
          </div>
          <div className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>Solution</h3>
            {isEditing ? <textarea className="glass-input" value={editData.solution} onChange={e => setEditData({...editData, solution: e.target.value})} /> : <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>{project.solution || 'No solution recorded.'}</p>}
          </div>
          <div className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>Results</h3>
            {isEditing ? <textarea className="glass-input" value={editData.results} onChange={e => setEditData({...editData, results: e.target.value})} /> : <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>{project.results || 'No results recorded.'}</p>}
          </div>
        </div>

        <div className="before-after-section glass" style={{ padding: '48px', borderRadius: '24px', border: '1px solid var(--primary)' }}>
          <h2 style={{ marginBottom: '40px', textAlign: 'center' }}>Before & After</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
            <div>
              <span className="badge glass" style={{ marginBottom: '16px', borderColor: 'var(--accent)' }}>Before</span>
              <div style={{ display: 'grid', gap: '16px' }}>
                {(project.beforeImages || []).map((img, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={getImageUrl(img)} style={{ width: '100%', borderRadius: '16px' }} />
                    {session && <button onClick={() => deleteImage('before', img)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}>×</button>}
                  </div>
                ))}
              </div>
              {session && (
                <>
                  <input type="file" multiple ref={beforeInputRef} className="glass-input" style={{ marginTop: '16px' }} onChange={e => setBeforeFiles(e.target.files)} />
                  <button className="btn-primary" style={{ width: '100%', marginTop: '10px', padding: '10px' }} onClick={() => handleImageUpload('before')} disabled={!beforeFiles}>Upload Before</button>
                </>
              )}
            </div>
            <div>
              <span className="badge glass" style={{ marginBottom: '16px', borderColor: '#10b981' }}>After</span>
              <div style={{ display: 'grid', gap: '16px' }}>
                {(project.afterImages || []).map((img, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={getImageUrl(img)} style={{ width: '100%', borderRadius: '16px', border: '1px solid var(--primary)' }} />
                    {session && <button onClick={() => deleteImage('after', img)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}>×</button>}
                  </div>
                ))}
              </div>
              {session && (
                <>
                  <input type="file" multiple ref={afterInputRef} className="glass-input" style={{ marginTop: '16px' }} onChange={e => setAfterFiles(e.target.files)} />
                  <button className="btn-primary" style={{ width: '100%', marginTop: '10px', padding: '10px' }} onClick={() => handleImageUpload('after')} disabled={!afterFiles}>Upload After</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {moreProjects.length > 0 && (
        <section style={{ marginTop: '120px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '60px', textAlign: 'center' }}>More Selected Works</h2>
          <div className="products-grid">
            {moreProjects.map((p: Project) => (
              <div key={p.id} className="product-card glass">
                <img src={getMainImage(p)} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '18px', marginBottom: '16px' }} />
                <h3 className="product-name">{p.title}</h3>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{p.type} • {p.sole} • {p.brand}</span>
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

function TagDropdown({ tags, selected, onToggle, onSelectOnly, onClear }: any) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) { if (e.key === 'Enter' || e.key === 'ArrowDown') setIsOpen(true); return }
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setHighlightedIndex(prev => (prev + 1) % tags.length); break
      case 'ArrowUp': e.preventDefault(); setHighlightedIndex(prev => (prev - 1 + tags.length) % tags.length); break
      case 'Enter': e.preventDefault(); onSelectOnly(tags[highlightedIndex]); setIsOpen(false); break
      case ' ': e.preventDefault(); onToggle(tags[highlightedIndex]); break
      case 'Escape': setIsOpen(false); break
    }
  }
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false) }
    document.addEventListener('mousedown', handleClickOutside); return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <button className="dropdown-trigger" onClick={() => setIsOpen(!isOpen)} onKeyDown={handleKeyDown}>
        <span>{selected.length === 0 ? 'Filter by Category' : `${selected.length} active filters`}</span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }}>▼</span>
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          {tags.map((tag: string, index: number) => (
            <div key={tag} className={`dropdown-item ${index === highlightedIndex ? 'highlighted' : ''} ${selected.includes(tag) ? 'selected' : ''}`} onMouseEnter={() => setHighlightedIndex(index)} onClick={() => onToggle(tag)}>
              <div className="checkbox">{selected.includes(tag) ? '✓' : ''}</div>
              <span><span className="tag-prefix">#</span>{tag}</span>
            </div>
          ))}
          {selected.length > 0 && <div className="dropdown-item" style={{ borderTop: '1px solid var(--glass-border)', marginTop: '8px', color: 'var(--accent)' }} onClick={() => { onClear(); setIsOpen(false); }}>Clear All</div>}
        </div>
      )}
    </div>
  )
}

function Home({ projects }: { projects: Project[] }) {
  const [selType, setSelType] = useState<string[]>([])
  const [selSole, setSelSole] = useState<string[]>([])
  const [selBrand, setSelBrand] = useState<string[]>([])
  const toggle = (list: string[], set: Function, val: string) => set(list.includes(val) ? list.filter(t => t !== val) : [...list, val])
  const filtered = (projects || []).filter(p => (selType.length === 0 || selType.includes(p.type)) && (selSole.length === 0 || selSole.includes(p.sole)) && (selBrand.length === 0 || selBrand.includes(p.brand)))
  const allTypes = [...new Set((projects || []).map(p => p.type))].filter(Boolean).sort()
  const allSoles = [...new Set((projects || []).map(p => p.sole))].filter(Boolean).sort()
  const allBrands = [...new Set((projects || []).map(p => p.brand))].filter(Boolean).sort()

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <span className="badge glass">Sole Customization & Resole</span>
          <h1>Give the second life <br/> to your shoes by using <br/> VIBRAM soles.</h1>
          {SHOW_WORK_BTN && (
            <button className="btn-primary" onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })}>View Projects</button>
          )}
        </div>
      </section>

      <section id="work" className="products-section container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h2 className="section-title" style={{ marginBottom: '0' }}>Selected Works</h2>
          {(selType.length > 0 || selSole.length > 0 || selBrand.length > 0) && (
            <button onClick={() => { setSelType([]); setSelSole([]); setSelBrand([]); }} style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', color: 'var(--accent)', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Clear All Filters</button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '60px' }}>
          <div><label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Type</label><TagDropdown tags={allTypes} selected={selType} onToggle={(v: string) => toggle(selType, setSelType, v)} onSelectOnly={(v: string) => setSelType([v])} onClear={() => setSelType([])} /></div>
          <div><label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Sole</label><TagDropdown tags={allSoles} selected={selSole} onToggle={(v: string) => toggle(selSole, setSelSole, v)} onSelectOnly={(v: string) => setSelSole([v])} onClear={() => setSelSole([])} /></div>
          <div><label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Brand</label><TagDropdown tags={allBrands} selected={selBrand} onToggle={(v: string) => toggle(selBrand, setSelBrand, v)} onSelectOnly={(v: string) => setSelBrand([v])} onClear={() => setSelBrand([])} /></div>
        </div>
        <div className="products-grid">
          {filtered.map(p => (
            <div key={p.id} className="product-card glass">
              <div className="product-image"><img src={getMainImage(p)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }} /></div>
              <h3 className="product-name">{p.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '16px' }}>{p.type} • {p.sole} • {p.brand}</p>
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
  const [contacts, setContacts] = useState<ContactMessage[]>([])
  const [session, setSession] = useState<Session | null>(null)
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [isPortalOpen, setIsPortalOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [portalSearch, setPortalSearch] = useState('')
  const [contactService, setContactService] = useState('')
  
  const [newProject, setNewProject] = useState({ title: '', type: '', sole: '', brand: '', desc: '', challenge: '', solution: '', results: '' })
  const [files, setFiles] = useState<{ before: FileList | null, after: FileList | null }>({ before: null, after: null })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchContacts()
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchContacts()
    })
    fetchProjects()
    window.addEventListener('scroll', () => setScrolled(window.scrollY > 50))
  }, [])

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('*').order('id', { ascending: false })
    if (data) setProjects(data)
  }

  const fetchContacts = async () => {
    const { data } = await supabase.from('contacts').select('*').order('created_at', { ascending: false })
    if (data) setContacts(data)
  }

  const uploadFile = async (file: File) => {
    const fileName = `${Math.random()}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from('project-assets').upload(fileName, file)
    if (error) throw error
    return fileName
  }

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const beforePaths = files.before ? await Promise.all(Array.from(files.before).map(f => uploadFile(f))) : []
      const afterPaths = files.after ? await Promise.all(Array.from(files.after).map(f => uploadFile(f))) : []
      const { error } = await supabase.from('projects').insert([{
        title: newProject.title, type: newProject.type, sole: newProject.sole, brand: newProject.brand,
        description: newProject.desc, challenge: newProject.challenge, solution: newProject.solution,
        results: newProject.results, beforeImages: beforePaths, afterImages: afterPaths,
        image: beforePaths.length > 0 ? beforePaths[0] : ''
      }])
      if (error) throw error
      setIsAdminOpen(false); fetchProjects(); alert("Project added!")
    } catch (err: any) { alert(err.message) }
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      service: contactService,
      message: formData.get('message')
    }
    
    try {
      const { error } = await supabase.from('contacts').insert([data])
      if (error) throw error
      alert("Message sent! We will get back to you soon.")
      setIsContactOpen(false)
      fetchContacts()
    } catch (err: any) {
      alert(`Error: ${err.message}. (Note: Ensure 'contacts' table exists in Supabase)`)
    }
  }

  const handleLogout = () => supabase.auth.signOut()

  return (
    <Router>
      <Header onAdmin={() => setIsAdminOpen(true)} onPortal={() => setIsPortalOpen(true)} onContact={() => setIsContactOpen(true)} scrolled={scrolled} session={session} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home projects={projects} />} />
        <Route path="/login" element={session ? <Navigate to="/" /> : <Login />} />
        <Route path="/project/:id" element={<ProjectDetail projects={projects} onUpdate={fetchProjects} session={session} />} />
      </Routes>

      <div className={`cart-overlay ${(isAdminOpen || isPortalOpen || isContactOpen) ? 'open' : ''}`} onClick={() => { setIsAdminOpen(false); setIsPortalOpen(false); setIsContactOpen(false); }} />
      <div className={`cart-drawer glass ${isAdminOpen ? 'open' : ''}`}>
        <div className="cart-header"><h2>Add Project</h2><button onClick={() => setIsAdminOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px' }}>×</button></div>
        <form className="contact-form" onSubmit={handleProjectSubmit} style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
          <div className="form-group"><label>Title</label><input className="glass-input" required onChange={e => setNewProject({...newProject, title: e.target.value})} /></div>
          <FormDropdown label="Type" options={[...new Set(projects.map(p => p.type))].filter(Boolean)} value={newProject.type} onChange={(val: string) => setNewProject({...newProject, type: val})} placeholder="Select or type new..." />
          <FormDropdown label="Sole" options={[...new Set(projects.map(p => p.sole))].filter(Boolean)} value={newProject.sole} onChange={(val: string) => setNewProject({...newProject, sole: val})} placeholder="Select or type new..." />
          <FormDropdown label="Brand" options={[...new Set(projects.map(p => p.brand))].filter(Boolean)} value={newProject.brand} onChange={(val: string) => setNewProject({...newProject, brand: val})} placeholder="Select or type new..." />
          <div className="form-group"><label>Overview</label><textarea className="glass-input" required onChange={e => setNewProject({...newProject, desc: e.target.value})} /></div>
          <div className="form-group"><label>The Challenge</label><textarea className="glass-input" onChange={e => setNewProject({...newProject, challenge: e.target.value})} /></div>
          <div className="form-group"><label>The Solution</label><textarea className="glass-input" onChange={e => setNewProject({...newProject, solution: e.target.value})} /></div>
          <div className="form-group"><label>Key Results</label><textarea className="glass-input" onChange={e => setNewProject({...newProject, results: e.target.value})} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group"><label>Before Images</label><input type="file" multiple className="glass-input" onChange={e => setFiles({...files, before: e.target.files})} /></div>
            <div className="form-group"><label>After Images</label><input type="file" multiple className="glass-input" onChange={e => setFiles({...files, after: e.target.files})} /></div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '40px' }}>Upload Project</button>
        </form>
      </div>

      <div className={`cart-drawer glass ${isContactOpen ? 'open' : ''}`} style={{ maxWidth: session ? '600px' : '500px' }}>
        <div className="cart-header">
          <h2>{session ? 'Contact Inquiries' : 'Contact Us'}</h2>
          <button onClick={() => setIsContactOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px' }}>×</button>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
          {session ? (
            <div className="contact-list">
              {contacts.length === 0 ? (
                <p style={{ color: '#94a3b8' }}>No inquiries yet.</p>
              ) : (
                contacts.map(c => (
                  <div key={c.id} className="glass" style={{ padding: '20px', borderRadius: '16px', marginBottom: '16px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ color: 'var(--primary)' }}>{c.name}</h4>
                        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.email}</p>
                      </div>
                      <span className="badge glass" style={{ margin: 0, fontSize: '0.6rem', padding: '4px 8px' }}>{c.service}</span>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.4', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>{c.message}</p>
                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: '#475569' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                      <button 
                        onClick={async () => {
                          if (confirm("Delete this inquiry?")) {
                            const { error } = await supabase.from('contacts').delete().eq('id', c.id)
                            if (!error) fetchContacts()
                          }
                        }}
                        style={{ background: 'none', border: 'none', color: '#f43f5e', fontSize: '0.8rem', cursor: 'pointer' }}
                      >Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Reach out for custom resole inquiries or any questions about our services.</p>
              <form className="contact-form" onSubmit={handleContactSubmit}>
                <div className="form-group"><label>Name</label><input name="name" className="glass-input" required placeholder="Your name" /></div>
                <div className="form-group"><label>Email</label><input name="email" type="email" className="glass-input" required placeholder="your@email.com" /></div>
                <FormDropdown label="Service" options={['Full Resole', 'Heel Repair', 'Custom Build', 'Cleaning & Care']} value={contactService} onChange={setContactService} placeholder="Select a service..." />
                <div className="form-group"><label>Message</label><textarea name="message" className="glass-input" required placeholder="Tell us about your shoes..." style={{ height: '150px' }} /></div>
                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>Send Message</button>
              </form>
              <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '8px' }}>Direct Contact</h4>
                  <p style={{ color: '#94a3b8' }}>hello@solelab.com</p>
                  <p style={{ color: '#94a3b8' }}>+66 81 234 5678</p>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '8px' }}>Follow Us</h4>
                  <a href="#" className="view-link" style={{ marginTop: '0' }}>Instagram</a>
                  <a href="#" className="view-link" style={{ marginTop: '8px' }}>Facebook</a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={`cart-drawer glass ${isPortalOpen ? 'open' : ''}`} style={{ maxWidth: '600px' }}>
        <div className="cart-header"><h2>Project Portal</h2><button onClick={() => setIsPortalOpen(false)} style={{ background: 'none', border: 'none', color: 'white' }}>×</button></div>
        <div style={{ padding: '0 0 20px 0' }}><input type="text" className="glass-input" placeholder="Search projects by title..." value={portalSearch} onChange={e => setPortalSearch(e.target.value)} /></div>
        <div className="portal-content" style={{ overflowY: 'auto', flex: 1 }}>
          {(projects || [])
            .filter(p => p.title.toLowerCase().includes(portalSearch.toLowerCase()))
            .map(p => (
            <div key={p.id} className="portal-item glass" style={{ padding: '16px', borderRadius: '16px', marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Link to={`/project/${p.id}`} onClick={() => setIsPortalOpen(false)} style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1, textDecoration: 'none', color: 'inherit' }}>
                <img src={getMainImage(p)} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}><h4>{p.title}</h4></div>
              </Link>
              <button onClick={async () => { if(confirm("Delete?")) { const { error } = await supabase.from('projects').delete().eq('id', p.id); if (!error) fetchProjects(); } }} style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', padding: '8px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </Router>
  )
}

export default App
