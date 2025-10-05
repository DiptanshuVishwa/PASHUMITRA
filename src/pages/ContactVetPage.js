import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiSearch, 
  FiMapPin, 
  FiPhone, 
  FiMail, 
  FiStar,
  FiClock,
  FiCalendar,
  FiHeart,
  FiAward,
  FiFilter,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';

const ContactVetContainer = styled.div`
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
  min-height: calc(100vh - 80px);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 50px;
  
  h1 {
    font-size: 2.5rem;
    color: var(--dark-gray);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    
    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }
  
  .header-icon {
    color: var(--primary-coral);
    font-size: 2.5rem;
  }
  
  p {
    font-size: 1.2rem;
    color: #666;
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.6;
    
    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }
`;

const SearchAndFilter = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
  align-items: center;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const SearchBox = styled.div`
  flex: 1;
  position: relative;
  min-width: 300px;
  
  input {
    width: 100%;
    padding: 14px 50px 14px 20px;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    font-size: 16px;
    transition: border-color 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: var(--primary-coral);
    }
    
    &::placeholder {
      color: #999;
    }
  }
  
  .search-icon {
    position: absolute;
    right: 18px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
    font-size: 18px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 10px 16px;
  border: 2px solid ${props => props.active ? 'var(--primary-coral)' : '#e0e0e0'};
  background: ${props => props.active ? 'var(--primary-coral)' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  
  &:hover {
    border-color: var(--primary-coral);
    background: ${props => props.active ? 'var(--primary-coral)' : 'rgba(255, 127, 80, 0.1)'};
    color: ${props => props.active ? 'white' : 'var(--primary-coral)'};
  }
`;

const EmergencyBanner = styled(motion.div)`
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  text-align: center;
  
  .emergency-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .emergency-number {
    font-size: 1.5rem;
    font-weight: 800;
    margin-bottom: 8px;
  }
  
  .emergency-desc {
    opacity: 0.9;
  }
`;

const VetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const VetCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(255, 127, 80, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const VetHeader = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  
  .vet-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-coral), #FF6A35);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
    font-weight: 600;
    flex-shrink: 0;
  }
  
  .vet-info {
    flex: 1;
    
    .vet-name {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--dark-gray);
      margin-bottom: 6px;
    }
    
    .vet-title {
      color: var(--primary-coral);
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .vet-rating {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      
      .stars {
        color: #ffd700;
        display: flex;
        gap: 2px;
      }
      
      .rating-text {
        color: #666;
        font-size: 14px;
      }
    }
    
    .vet-experience {
      color: #666;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
`;

const VetSpecialties = styled.div`
  margin-bottom: 16px;
  
  .specialties-title {
    font-weight: 600;
    color: var(--dark-gray);
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  .specialties-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .specialty-tag {
    background: rgba(255, 127, 80, 0.1);
    color: var(--primary-coral);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }
`;

const VetContact = styled.div`
  margin-bottom: 20px;
  
  .contact-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    color: #666;
    font-size: 14px;
    
    .contact-icon {
      color: var(--primary-coral);
      font-size: 16px;
    }
  }
`;

const VetAvailability = styled.div`
  margin-bottom: 20px;
  
  .availability-title {
    font-weight: 600;
    color: var(--dark-gray);
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  .availability-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    
    &.available {
      color: #28a745;
    }
    
    &.busy {
      color: #ffc107;
    }
    
    &.unavailable {
      color: #dc3545;
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }
  }
  
  .availability-hours {
    color: #666;
    font-size: 12px;
    margin-top: 4px;
  }
`;

const VetActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  flex: 1;
  min-width: 120px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  
  &.primary {
    background: var(--primary-coral);
    color: white;
    
    &:hover {
      background: #FF6A35;
      transform: translateY(-1px);
    }
  }
  
  &.secondary {
    background: #f8f9fa;
    color: var(--dark-gray);
    border: 2px solid #e0e0e0;
    
    &:hover {
      border-color: var(--primary-coral);
      color: var(--primary-coral);
    }
  }
  
  &.success {
    background: #28a745;
    color: white;
    
    &:hover {
      background: #218838;
    }
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
  
  .no-results-icon {
    font-size: 4rem;
    color: #ccc;
    margin-bottom: 20px;
  }
  
  h3 {
    color: var(--dark-gray);
    margin-bottom: 12px;
  }
  
  p {
    font-size: 16px;
    line-height: 1.6;
  }
`;

const ContactVetPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');

  const specialties = [
    { id: 'all', label: 'All Specialists' },
    { id: 'livestock', label: 'Livestock' },
    { id: 'poultry', label: 'Poultry' },
    { id: 'swine', label: 'Swine' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'surgery', label: 'Surgery' }
  ];

  const availability = [
    { id: 'all', label: 'All' },
    { id: 'available', label: 'Available Now' },
    { id: 'today', label: 'Available Today' },
    { id: 'emergency', label: 'Emergency Only' }
  ];

  const veterinarians = [
    {
      id: 1,
      name: 'Dr. Rajesh Kumar',
      title: 'Senior Veterinary Specialist',
      avatar: 'RK',
      rating: 4.8,
      reviews: 156,
      experience: '12 years',
      specialties: ['Livestock', 'Dairy', 'Surgery'],
      phone: '+91 98765 43210',
      email: 'rajesh.kumar@vetclinic.com',
      location: 'Srikakulam, Andhra Pradesh',
      availability: 'available',
      status: 'Available Now',
      hours: 'Mon-Sat: 9:00 AM - 6:00 PM',
      consultationFee: '₹500'
    },
    {
      id: 2,
      name: 'Dr. Priya Sharma',
      title: 'Poultry Health Expert',
      avatar: 'PS',
      rating: 4.9,
      reviews: 203,
      experience: '8 years',
      specialties: ['Poultry', 'Emergency', 'Disease Control'],
      phone: '+91 98765 43211',
      email: 'priya.sharma@poultrycare.com',
      location: 'Visakhapatnam, Andhra Pradesh',
      availability: 'busy',
      status: 'In Consultation',
      hours: 'Mon-Fri: 8:00 AM - 7:00 PM',
      consultationFee: '₹400'
    },
    {
      id: 3,
      name: 'Dr. Suresh Reddy',
      title: 'Swine Specialist',
      avatar: 'SR',
      rating: 4.7,
      reviews: 89,
      experience: '15 years',
      specialties: ['Swine', 'Nutrition', 'Breeding'],
      phone: '+91 98765 43212',
      email: 'suresh.reddy@swinecare.com',
      location: 'Hyderabad, Telangana',
      availability: 'available',
      status: 'Available Today',
      hours: 'Tue-Sun: 10:00 AM - 5:00 PM',
      consultationFee: '₹600'
    },
    {
      id: 4,
      name: 'Dr. Meera Patel',
      title: 'Emergency Veterinarian',
      avatar: 'MP',
      rating: 4.9,
      reviews: 267,
      experience: '10 years',
      specialties: ['Emergency', 'Critical Care', 'Surgery'],
      phone: '+91 98765 43213',
      email: 'meera.patel@emergencyvet.com',
      location: 'Chennai, Tamil Nadu',
      availability: 'available',
      status: '24/7 Emergency',
      hours: 'Available 24/7',
      consultationFee: '₹800'
    },
    {
      id: 5,
      name: 'Dr. Anil Joshi',
      title: 'Dairy Cattle Specialist',
      avatar: 'AJ',
      rating: 4.6,
      reviews: 134,
      experience: '18 years',
      specialties: ['Dairy', 'Reproduction', 'Nutrition'],
      phone: '+91 98765 43214',
      email: 'anil.joshi@dairycare.com',
      location: 'Pune, Maharashtra',
      availability: 'unavailable',
      status: 'Next Available: Tomorrow',
      hours: 'Mon-Fri: 9:00 AM - 5:00 PM',
      consultationFee: '₹550'
    },
    {
      id: 6,
      name: 'Dr. Kavitha Nair',
      title: 'Livestock Health Consultant',
      avatar: 'KN',
      rating: 4.8,
      reviews: 178,
      experience: '9 years',
      specialties: ['Livestock', 'Preventive Care', 'Vaccines'],
      phone: '+91 98765 43215',
      email: 'kavitha.nair@livestock.com',
      location: 'Kochi, Kerala',
      availability: 'available',
      status: 'Available Now',
      hours: 'Mon-Sat: 8:30 AM - 6:30 PM',
      consultationFee: '₹450'
    }
  ];

  const filteredVets = veterinarians.filter(vet => {
    const matchesSearch = vet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vet.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         vet.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'all' || 
                           vet.specialties.some(s => s.toLowerCase() === selectedSpecialty);
    
    const matchesAvailability = selectedAvailability === 'all' || 
                              (selectedAvailability === 'available' && vet.availability === 'available') ||
                              (selectedAvailability === 'today' && vet.availability !== 'unavailable') ||
                              (selectedAvailability === 'emergency' && vet.specialties.includes('Emergency'));
    
    return matchesSearch && matchesSpecialty && matchesAvailability;
  });

  const getStatusIcon = (availability) => {
    switch (availability) {
      case 'available': return <FiCheckCircle />;
      case 'busy': return <FiClock />;
      case 'unavailable': return <FiAlertCircle />;
      default: return <FiClock />;
    }
  };

  const handleBookConsultation = (vet) => {
    alert(`Booking consultation with ${vet.name}. You will be redirected to the booking system.`);
  };

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <ContactVetContainer>
      <Header>
        <h1>
          <FiHeart className="header-icon" />
          Contact a Veterinarian
        </h1>
        <p>
          Connect with qualified veterinarians in your area for expert advice, 
          emergency care, and regular health checkups for your livestock.
        </p>
      </Header>

      <EmergencyBanner
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="emergency-title">
          <FiAlertCircle />
          24/7 Emergency Hotline
        </div>
        <div className="emergency-number">📞 1800-VET-HELP</div>
        <div className="emergency-desc">
          For critical emergencies, call immediately for instant veterinary support
        </div>
      </EmergencyBanner>

      <SearchAndFilter>
        <SearchBox>
          <input
            type="text"
            placeholder="Search by name, specialty, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FiSearch className="search-icon" />
        </SearchBox>

        <FilterGroup>
          <FiFilter style={{ color: '#666' }} />
          {specialties.map((specialty) => (
            <FilterButton
              key={specialty.id}
              active={selectedSpecialty === specialty.id}
              onClick={() => setSelectedSpecialty(specialty.id)}
            >
              {specialty.label}
            </FilterButton>
          ))}
        </FilterGroup>

        <FilterGroup>
          {availability.map((avail) => (
            <FilterButton
              key={avail.id}
              active={selectedAvailability === avail.id}
              onClick={() => setSelectedAvailability(avail.id)}
            >
              {avail.label}
            </FilterButton>
          ))}
        </FilterGroup>
      </SearchAndFilter>

      {filteredVets.length === 0 ? (
        <NoResults>
          <FiSearch className="no-results-icon" />
          <h3>No veterinarians found</h3>
          <p>
            Try adjusting your search criteria or browse all available specialists. 
            For emergency situations, please call our 24/7 hotline above.
          </p>
        </NoResults>
      ) : (
        <VetGrid>
          {filteredVets.map((vet, index) => (
            <VetCard
              key={vet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <VetHeader>
                <div className="vet-avatar">{vet.avatar}</div>
                <div className="vet-info">
                  <div className="vet-name">{vet.name}</div>
                  <div className="vet-title">{vet.title}</div>
                  <div className="vet-rating">
                    <div className="stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar 
                          key={star} 
                          fill={star <= Math.floor(vet.rating) ? '#ffd700' : 'none'}
                          color="#ffd700"
                        />
                      ))}
                    </div>
                    <span className="rating-text">
                      {vet.rating} ({vet.reviews} reviews)
                    </span>
                  </div>
                  <div className="vet-experience">
                    <FiAward />
                    {vet.experience} experience
                  </div>
                </div>
              </VetHeader>

              <VetSpecialties>
                <div className="specialties-title">Specialties</div>
                <div className="specialties-list">
                  {vet.specialties.map((specialty, idx) => (
                    <span key={idx} className="specialty-tag">
                      {specialty}
                    </span>
                  ))}
                </div>
              </VetSpecialties>

              <VetContact>
                <div className="contact-item">
                  <FiMapPin className="contact-icon" />
                  {vet.location}
                </div>
                <div className="contact-item">
                  <FiPhone className="contact-icon" />
                  {vet.phone}
                </div>
                <div className="contact-item">
                  <FiMail className="contact-icon" />
                  {vet.email}
                </div>
              </VetContact>

              <VetAvailability>
                <div className="availability-title">Availability</div>
                <div className={`availability-status ${vet.availability}`}>
                  <span className="status-dot"></span>
                  {getStatusIcon(vet.availability)}
                  {vet.status}
                </div>
                <div className="availability-hours">{vet.hours}</div>
              </VetAvailability>

              <VetActions>
                <ActionButton 
                  className="primary"
                  onClick={() => handleBookConsultation(vet)}
                >
                  <FiCalendar />
                  Book ({vet.consultationFee})
                </ActionButton>
                <ActionButton 
                  className="success"
                  onClick={() => handleCall(vet.phone)}
                >
                  <FiPhone />
                  Call
                </ActionButton>
                <ActionButton 
                  className="secondary"
                  onClick={() => handleEmail(vet.email)}
                >
                  <FiMail />
                  Email
                </ActionButton>
              </VetActions>
            </VetCard>
          ))}
        </VetGrid>
      )}
    </ContactVetContainer>
  );
};

export default ContactVetPage;