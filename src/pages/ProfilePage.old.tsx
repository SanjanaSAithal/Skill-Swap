import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { getInitials, handleApiError } from '../utils/helpers';
import './ProfilePage.css';

interface Skill {
  _id?: string;
  skillName: string;
  level?: string;
  creditsPerHour?: number;
  description?: string;
}

interface ModalProps {
  modalType: 'teach' | 'learn';
  onClose: () => void;
  onSubmit: (skill: Skill) => void;
}

interface UserProfile {
  name: string;
  email: string;
  college?: string;
  yearOfStudy?: string;
  bio?: string;
  creditBalance: number;
  skillsToTeach: Skill[];
  skillsToLearn: string[];
}

const AddSkillModal = ({ modalType, onClose, onSubmit }: ModalProps) => {
  const [formData, setFormData] = useState<Skill>({
    skillName: '',
    level: modalType === 'teach' ? 'Beginner' : undefined,
    creditsPerHour: modalType === 'teach' ? 1 : undefined,
    description: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.skillName.trim()) {
      setError('Skill name is required');
      return;
    }

    if (modalType === 'teach' && (!formData.level || !formData.creditsPerHour)) {
      setError('All fields are required for teaching skills');
      return;
    }

    onSubmit(formData);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.skillName.trim()) {
      setError('Skill name is required');
      return;
    }

    if (modalType === 'teach' && (!formData.level || !formData.creditsPerHour)) {
      setError('All fields are required for teaching skills');
      return;
    }

    onSubmit(formData);
    onClose();
  };

  const title = modalType === 'teach' ? 'Add Skill to Teach' : 'Add Skill to Learn';
  const subtitle = modalType === 'teach' 
    ? 'Add a skill you can teach others to earn credits'
    : 'Add a skill you want to learn from others';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{title}</h2>
            <p className="modal-subtitle">{subtitle}</p>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form className="modal-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="skillName" className="form-label">Skill Name</label>
            <input 
              id="skillName" 
              type="text" 
              placeholder="e.g., Guitar, Python, Spanish" 
              className="modal-input"
              value={formData.skillName}
              onChange={(e) => setFormData({ ...formData, skillName: e.target.value })}
            />
          </div>

          {modalType === 'teach' && (
            <>
              <div className="form-group">
                <label htmlFor="level" className="form-label">Proficiency Level</label>
                <select 
                  id="level" 
                  className="modal-select"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="credits" className="form-label">Credits Per Hour</label>
                <select 
                  id="credits" 
                  className="modal-select"
                  value={formData.creditsPerHour}
                  onChange={(e) => setFormData({ ...formData, creditsPerHour: Number(e.target.value) })}
                >
                  <option value={1}>1 credit (Standard)</option>
                  <option value={2}>2 credits</option>
                  <option value={3}>3 credits</option>
                </select>
                <p className="form-helper-text">Typically 1 credit, but experts can charge 2-3 credits</p>
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea 
                  id="description" 
                  placeholder="Describe what you'll teach..." 
                  className="modal-textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-btn-submit">
              Add Skill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface UserProfile {
  name: string;
  email: string;
  college?: string;
  yearOfStudy?: string;
  bio?: string;
  creditBalance: number;
  skillsToTeach: Skill[];
  skillsToLearn: string[];
}

function ProfilePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'teach' | 'learn'>('teach');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        const response = await axios.get('/api/profile', config);
        setProfile(response.data);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, token, navigate]);

  const handleAddSkill = async (skill: Skill) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (modalType === 'teach') {
        const response = await axios.post('/api/profile/skills/teach', skill, config);
        setProfile(prev => prev ? {
          ...prev,
          skillsToTeach: response.data
        } : null);
      } else {
        const response = await axios.post('/api/profile/skills/learn', { skillName: skill.skillName }, config);
        setProfile(prev => prev ? {
          ...prev,
          skillsToLearn: response.data
        } : null);
      }
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleRemoveSkill = async (skillId: string, type: 'teach' | 'learn') => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (type === 'teach') {
        const response = await axios.delete(`/api/profile/skills/teach/${skillId}`, config);
        setProfile(prev => prev ? {
          ...prev,
          skillsToTeach: response.data
        } : null);
      } else {
        const response = await axios.delete(`/api/profile/skills/learn/${skillId}`, config);
        setProfile(prev => prev ? {
          ...prev,
          skillsToLearn: response.data
        } : null);
      }
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div>
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your teaching and learning journey</p>
        </div>

        <div className="header-actions">
          <div className="credit-balance">
            <span className="credit-label">Credit Balance</span>
            <span className="credit-amount">{profile.creditBalance}</span>
          </div>
          <Link to="/discover" className="header-btn header-btn-primary">
            <span>Discover Skills</span>
          </Link>
          <button onClick={() => navigate('/logout')} className="header-btn header-btn-secondary">
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-info">
          <div className="profile-avatar">
            <span>{getInitials(profile.name)}</span>
          </div>
          <div className="profile-details">
            <div className="info-group">
              <span className="info-label">Name</span>
              <span className="info-value">{profile.name}</span>
            </div>
            <div className="info-group">
              <span className="info-label">Email</span>
              <span className="info-value">{profile.email}</span>
            </div>
            <div className="info-group">
              <span className="info-label">College</span>
              <span className="info-value">{profile.college || '-'}</span>
            </div>
            <div className="info-group">
              <span className="info-label">Year of Study</span>
              <span className="info-value">{profile.yearOfStudy || '-'}</span>
            </div>
            <div className="info-group" style={{ gridColumn: '1 / -1' }}>
              <span className="info-label">Bio</span>
              <span className="info-value">{profile.bio || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-card">
        <div className="section-header">
          <h2 className="section-title">
            <span>Skills I Can Teach</span>
          </h2>
          <button 
            className="add-skill-btn"
            onClick={() => {
              setModalType('teach');
              setIsModalOpen(true);
            }}
          >
            <span>Add Skill</span>
          </button>
        </div>

        <div className="skills-grid">
          {profile.skillsToTeach.map((skill) => (
            <div key={skill._id} className="skill-card">
              <div className="skill-card-header">
                <h3 className="skill-name">{skill.skillName}</h3>
                <span className="skill-level">{skill.level}</span>
              </div>
              <div className="skill-credits">
                <span>{skill.creditsPerHour} credits/hr</span>
              </div>
              <p className="skill-description">{skill.description}</p>
              <button
                className="remove-skill"
                onClick={() => skill._id && handleRemoveSkill(skill._id, 'teach')}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="profile-card">
        <div className="section-header">
          <h2 className="section-title">
            <span>Skills I Want to Learn</span>
          </h2>
          <button 
            className="add-skill-btn"
            onClick={() => {
              setModalType('learn');
              setIsModalOpen(true);
            }}
          >
            <span>Add Skill</span>
          </button>
        </div>

        <div className="skills-grid">
          {profile.skillsToLearn.map((skillName) => (
            <div key={skillName} className="skill-card">
              <h3 className="skill-name">{skillName}</h3>
              <button
                className="remove-skill"
                onClick={() => handleRemoveSkill(skillName, 'learn')}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <AddSkillModal
          modalType={modalType}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddSkill}
        />
      )}
    </div>
  );
}

export default ProfilePage;

interface Skill {
  skillName: string;
  level?: string;
  creditsPerHour?: number;
  description?: string;
}

interface ModalProps {
  modalType: 'teach' | 'learn';
  onClose: () => void;
  onSubmit: (skill: Skill) => void;
}

const AddSkillModal = ({ modalType, onClose, onSubmit }: ModalProps) => {
  const [formData, setFormData] = useState<Skill>({
    skillName: '',
    level: modalType === 'teach' ? 'Beginner' : undefined,
    creditsPerHour: modalType === 'teach' ? 1 : undefined,
    description: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.skillName.trim()) {
      setError('Skill name is required');
      return;
    }

    if (modalType === 'teach' && (!formData.level || !formData.creditsPerHour)) {
      setError('All fields are required for teaching skills');
      return;
    }

    onSubmit(formData);
    onClose();
  };

  const title = modalType === 'teach' ? 'Add Skill to Teach' : 'Add Skill to Learn';
  const subtitle = modalType === 'teach' 
    ? 'Add a skill you can teach others to earn credits'
    : 'Add a skill you want to learn from others';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{title}</h2>
            <p className="modal-subtitle">{subtitle}</p>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form className="modal-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="skillName" className="form-label">Skill Name</label>
            <input 
              id="skillName" 
              type="text" 
              placeholder="e.g., Guitar, Python, Spanish" 
              className="modal-input"
              value={formData.skillName}
              onChange={(e) => setFormData({ ...formData, skillName: e.target.value })}
            />
          </div>

          {modalType === 'teach' && (
            <>
              <div className="form-group">
                <label htmlFor="level" className="form-label">Proficiency Level</label>
                <select 
                  id="level" 
                  className="modal-select"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="credits" className="form-label">Credits Per Hour</label>
                <select 
                  id="credits" 
                  className="modal-select"
                  value={formData.creditsPerHour}
                  onChange={(e) => setFormData({ ...formData, creditsPerHour: Number(e.target.value) })}
                >
                  <option value={1}>1 credit (Standard)</option>
                  <option value={2}>2 credits</option>
                  <option value={3}>3 credits</option>
                </select>
                <p className="form-helper-text">Typically 1 credit, but experts can charge 2-3 credits</p>
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea 
                  id="description" 
                  placeholder="Describe what you'll teach..." 
                  className="modal-textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-btn-submit">
              Add Skill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// --- Profile Page Component ---
export default function ProfilePage() {
  // const { user } = useAuth(); // Use this when auth is connected
  
  // State for controlling the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'teach' | 'learn'>('teach');

  // Mock data based on your images
  const mockUser = {
    name: "Demo User",
    email: "sanjusaithal@gmail.com",
    college: "Demo University",
    yearOfStudy: "3rd Year",
    bio: "Passionate learner and teacher",
    credits: 10,
    initials: "DU"
  };

  const skillsToTeach = [
    {
      name: "Guitar",
      level: "Advanced",
      credits: 2,
      description: "Teaching acoustic and electric guitar for beginners and intermediate players"
    }
  ];

  const skillsToLearn = ["Python", "Spanish"];

  // Handlers to open/close the modal
  const openModal = (type: 'teach' | 'learn') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="profile-page-container">
      <div className="profile-page-content">
        
        {/* === Header === */}
        <header className="profile-header">
          <div className="header-title">
            <h1>My Profile</h1>
            <p>Manage your teaching and learning journey</p>
          </div>
          
          <div className="header-actions">
            <div className="credit-balance-btn">
              {/* Credit Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                <path d="M12 1v2"></path><path d="M12 21v2"></path>
              </svg>
              <span>Credit Balance</span>
              <span className="credit-amount">{mockUser.credits}</span>
            </div>
            
            <Link to="/discover" className="header-btn">
              {/* Discover Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 14.5V4A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span>Discover Skills</span>
            </Link>
            
            <button className="header-btn">
              {/* Logout Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* === Profile Information Card === */}
        <section className="profile-card">
          <div className="profile-card-header">
            <h2>Profile Information</h2>
            <button className="edit-btn">
              {/* Edit Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path>
              </svg>
              <span>Edit</span>
            </button>
          </div>
          
          <div className="profile-info-content">
            <div className="profile-avatar">
              {mockUser.initials}
            </div>
            <div className="profile-details-grid">
              <div className="detail-item">
                <label>Name</label>
                <p>{mockUser.name}</p>
              </div>
              <div className="detail-item">
                <label>Email</label>
                <p>{mockUser.email}</p>
              </div>
              <div className="detail-item">
                <label>College</label>
                <p>{mockUser.college}</p>
              </div>
              <div className="detail-item">
                <label>Year of Study</label>
                <p>{mockUser.yearOfStudy}</p>
              </div>
              <div className="detail-item full-span">
                <label>Bio</label>
                <p>{mockUser.bio}</p>
              </div>
            </div>
          </div>
        </section>

        {/* === Skills I Can Teach Card === */}
        <section className="profile-card">
          <div className="profile-card-header">
            <h2 className="skills-card-title">
              {/* Teach Icon (Mortarboard) */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2v-5"></path>
              </svg>
              <span>Skills I Can Teach</span>
            </h2>
            <button className="add-skill-btn" onClick={() => openModal('teach')}>
              {/* Plus Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Add Skill</span>
            </button>
          </div>
          <div className="skills-list">
            {skillsToTeach.map(skill => (
              <div key={skill.name} className="skill-item-teach">
                <div className="skill-item-header">
                  <h3>{skill.name}</h3>
                  <button className="skill-item-close-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className="skill-item-details">
                  <span className="skill-tag">{skill.level}</span>
                  <span className="skill-tag credits">
                    {/* Credit Icon */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                    </svg>
                    {skill.credits} credits/hr
                  </span>
                </div>
                <p className="skill-description">{skill.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* === Skills I Want to Learn Card === */}
        <section className="profile-card">
          {/* THIS IS THE LINE THAT WAS FIXED */}
          <div className="profile-card-header">
            <h2 className="skills-card-title">
              {/* Learn Icon (Book) */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 14.5V4A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span>Skills I Want To Learn</span>
            </h2>
            <button className="add-skill-btn" onClick={() => openModal('learn')}>
              {/* Plus Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Add Skill</span>
            </button>
          </div>
          <div className="skills-list-learn">
            {skillsToLearn.map(skill => (
              <span key={skill} className="skill-tag-learn">
                {skill}
                <button className="skill-tag-close-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </section>

      </div>

      {/* Render the modal conditionally */}
      {isModalOpen && (
        <AddSkillModal
          modalType={modalType}
          onClose={closeModal}
          onSubmit={(skill: Skill) => {
            if (modalType === 'teach') {
              // Add to skills to teach
              // You'll want to integrate this with your API
              console.log('Adding teaching skill:', skill);
            } else {
              // Add to skills to learn
              // You'll want to integrate this with your API
              console.log('Adding learning skill:', skill);
            }
            closeModal();
          }}
        />
      )}
    </div>
  );
}

