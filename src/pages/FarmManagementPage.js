import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiHome,
  FiUsers,
  FiActivity,
  FiCalendar,
  FiPlus,
  FiEdit,
  FiDownload,
  FiSearch,
  FiFilter,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiTrendingUp,
  FiBarChart,
  FiPieChart,
  FiEye
} from 'react-icons/fi';

const FarmContainer = styled.div`
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
  min-height: calc(100vh - 80px);
  
  @media (max-width: 768px) {
    padding: 0 10px;
    margin: 10px auto;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  
  h1 {
    font-size: 2.5rem;
    color: var(--dark-gray);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  
  .farm-icon {
    color: #28a745;
    font-size: 2.5rem;
  }
  
  p {
    font-size: 1.2rem;
    color: #666;
    max-width: 800px;
    margin: 0 auto;
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(255, 127, 80, 0.3);
    box-shadow: 0 12px 40px rgba(255, 127, 80, 0.15);
  }
  
  .card-header {
    display: flex;
    align-items: center;
    justify-content: between;
    margin-bottom: 20px;
    
    .card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--dark-gray);
    }
    
    .card-icon {
      color: var(--primary-coral);
      font-size: 20px;
    }
    
    .card-actions {
      display: flex;
      gap: 10px;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    margin-bottom: 20px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, ${props => props.gradient || 'var(--primary-coral), #ff6b35'});
  color: white;
  padding: 25px;
  border-radius: 15px;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: rotate(45deg);
  }
  
  .stat-icon {
    font-size: 2.5rem;
    margin-bottom: 12px;
    opacity: 0.9;
  }
  
  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 0.9rem;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .stat-trend {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin-top: 8px;
    font-size: 0.8rem;
    opacity: 0.8;
  }
`;

const TabContainer = styled.div`
  .tab-buttons {
    display: flex;
    gap: 8px;
    margin-bottom: 25px;
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 0;
  }
  
  .tab-button {
    padding: 12px 24px;
    border: none;
    background: none;
    color: #666;
    font-weight: 500;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.3s ease;
    
    &.active {
      color: var(--primary-coral);
      border-bottom-color: var(--primary-coral);
    }
    
    &:hover {
      color: var(--primary-coral);
    }
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 800px;
    
    th, td {
      text-align: left;
      padding: 12px 16px;
      border-bottom: 1px solid #e9ecef;
      white-space: nowrap;
    }
    
    th {
      background: #f8f9fa;
      font-weight: 600;
      color: var(--dark-gray);
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    td {
      font-size: 14px;
      color: #555;
    }
    
    tr:hover {
      background: rgba(255, 127, 80, 0.05);
    }
    
    @media (max-width: 768px) {
      min-width: 700px;
      
      th, td {
        padding: 8px 10px;
        font-size: 12px;
      }
    }
  }
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &.primary {
    background: var(--primary-coral);
    color: white;
    
    &:hover {
      background: #ff4500;
    }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #545b62;
    }
  }
  
  &.success {
    background: #28a745;
    color: white;
    
    &:hover {
      background: #218838;
    }
  }
  
  &.warning {
    background: #ffc107;
    color: #212529;
    
    &:hover {
      background: #e0a800;
    }
  }
  
  &.danger {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &.healthy {
    background: rgba(40, 167, 69, 0.1);
    color: #28a745;
  }
  
  &.sick {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
  }
  
  &.recovering {
    background: rgba(255, 193, 7, 0.1);
    color: #ffc107;
  }
  
  &.quarantine {
    background: rgba(255, 127, 80, 0.1);
    color: var(--primary-coral);
  }
  
  &.overdue {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
  }
  
  &.upcoming {
    background: rgba(255, 193, 7, 0.1);
    color: #ffc107;
  }
  
  &.completed {
    background: rgba(40, 167, 69, 0.1);
    color: #28a745;
  }
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 20px;
  
  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
  
  input {
    width: 100%;
    padding: 12px 40px;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: var(--primary-coral);
    }
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
  
  select {
    padding: 8px 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: var(--primary-coral);
    }
  }
`;

const FarmManagementPage = () => {
  const [activeTab, setActiveTab] = useState('livestock');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data - in a real app, this would come from API
  const livestockData = [
    {
      id: '001',
      tagNumber: 'COW-001',
      species: 'Cattle',
      breed: 'Holstein',
      age: '3 years',
      weight: '550 kg',
      location: 'Barn A-1',
      healthStatus: 'healthy',
      lastCheckup: '2024-01-15',
      nextVaccination: '2024-02-15'
    },
    {
      id: '002',
      tagNumber: 'COW-002',
      species: 'Cattle',
      breed: 'Jersey',
      age: '2 years',
      weight: '420 kg',
      location: 'Barn A-2',
      healthStatus: 'sick',
      lastCheckup: '2024-01-20',
      nextVaccination: '2024-02-10'
    },
    {
      id: '003',
      tagNumber: 'PIG-001',
      species: 'Pig',
      breed: 'Yorkshire',
      age: '1 year',
      weight: '180 kg',
      location: 'Barn B-1',
      healthStatus: 'recovering',
      lastCheckup: '2024-01-18',
      nextVaccination: '2024-02-20'
    },
    {
      id: '004',
      tagNumber: 'SHP-001',
      species: 'Sheep',
      breed: 'Merino',
      age: '2 years',
      weight: '65 kg',
      location: 'Field C',
      healthStatus: 'healthy',
      lastCheckup: '2024-01-12',
      nextVaccination: '2024-03-01'
    }
  ];

  const vaccinationSchedule = [
    {
      id: 1,
      animalTag: 'COW-001',
      vaccineName: 'FMD Vaccine',
      dueDate: '2024-02-15',
      status: 'upcoming',
      notes: 'Annual FMD vaccination'
    },
    {
      id: 2,
      animalTag: 'COW-002',
      vaccineName: 'Anthrax Vaccine',
      dueDate: '2024-02-10',
      status: 'overdue',
      notes: 'Overdue by 5 days'
    },
    {
      id: 3,
      animalTag: 'PIG-001',
      vaccineName: 'CSF Vaccine',
      dueDate: '2024-02-20',
      status: 'upcoming',
      notes: 'Classical Swine Fever'
    },
    {
      id: 4,
      animalTag: 'ALL',
      vaccineName: 'Rabies Vaccine',
      dueDate: '2024-01-10',
      status: 'completed',
      notes: 'All animals vaccinated'
    }
  ];

  const healthRecords = [
    {
      id: 1,
      animalTag: 'COW-002',
      date: '2024-01-20',
      issue: 'Respiratory infection',
      treatment: 'Antibiotics administered',
      veterinarian: 'Dr. Smith',
      status: 'recovering',
      followUp: '2024-01-27'
    },
    {
      id: 2,
      animalTag: 'PIG-001',
      date: '2024-01-18',
      issue: 'Minor injury',
      treatment: 'Wound cleaning and dressing',
      veterinarian: 'Dr. Johnson',
      status: 'healing',
      followUp: '2024-01-25'
    },
    {
      id: 3,
      animalTag: 'COW-001',
      date: '2024-01-15',
      issue: 'Routine checkup',
      treatment: 'General health assessment',
      veterinarian: 'Dr. Smith',
      status: 'healthy',
      followUp: '2024-04-15'
    }
  ];

  const farmStats = {
    totalAnimals: 127,
    healthyAnimals: 118,
    sickAnimals: 6,
    quarantineAnimals: 3,
    overdueVaccinations: 8,
    upcomingVaccinations: 15,
    avgWeight: 285,
    monthlyGrowth: 12
  };

  const filteredLivestock = useMemo(() => {
    return livestockData.filter(animal => {
      const matchesSearch = searchTerm === '' || 
        animal.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.breed.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = selectedFilter === 'all' || animal.healthStatus === selectedFilter;
      
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, selectedFilter]);

  const filteredVaccinations = useMemo(() => {
    return vaccinationSchedule.filter(vaccination => {
      const matchesSearch = searchTerm === '' || 
        vaccination.animalTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vaccination.vaccineName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = selectedFilter === 'all' || vaccination.status === selectedFilter;
      
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, selectedFilter]);

  const filteredHealthRecords = useMemo(() => {
    return healthRecords.filter(record => {
      const matchesSearch = searchTerm === '' || 
        record.animalTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.veterinarian.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [searchTerm]);

  const renderLivestockTable = () => (
    <TableContainer>
      <table>
        <thead>
          <tr>
            <th>Tag Number</th>
            <th>Species/Breed</th>
            <th>Age</th>
            <th>Weight</th>
            <th>Location</th>
            <th>Health Status</th>
            <th>Last Checkup</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredLivestock.map(animal => (
            <tr key={animal.id}>
              <td><strong>{animal.tagNumber}</strong></td>
              <td>{animal.species} - {animal.breed}</td>
              <td>{animal.age}</td>
              <td>{animal.weight}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiMapPin size={12} />
                  {animal.location}
                </div>
              </td>
              <td>
                <StatusBadge className={animal.healthStatus}>
                  {animal.healthStatus}
                </StatusBadge>
              </td>
              <td>{animal.lastCheckup}</td>
              <td>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <ActionButton className="primary">
                    <FiEye />
                    View
                  </ActionButton>
                  <ActionButton className="secondary">
                    <FiEdit />
                    Edit
                  </ActionButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableContainer>
  );

  const renderVaccinationTable = () => (
    <TableContainer>
      <table>
        <thead>
          <tr>
            <th>Animal Tag</th>
            <th>Vaccine</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredVaccinations.map(vaccination => (
            <tr key={vaccination.id}>
              <td><strong>{vaccination.animalTag}</strong></td>
              <td>{vaccination.vaccineName}</td>
              <td>{vaccination.dueDate}</td>
              <td>
                <StatusBadge className={vaccination.status}>
                  {vaccination.status}
                </StatusBadge>
              </td>
              <td>{vaccination.notes}</td>
              <td>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {vaccination.status === 'upcoming' && (
                    <ActionButton className="success">
                      <FiCheckCircle />
                      Mark Done
                    </ActionButton>
                  )}
                  <ActionButton className="primary">
                    <FiCalendar />
                    Reschedule
                  </ActionButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableContainer>
  );

  const renderHealthRecordsTable = () => (
    <TableContainer>
      <table>
        <thead>
          <tr>
            <th>Animal Tag</th>
            <th>Date</th>
            <th>Issue</th>
            <th>Treatment</th>
            <th>Veterinarian</th>
            <th>Status</th>
            <th>Follow-up</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredHealthRecords.map(record => (
            <tr key={record.id}>
              <td><strong>{record.animalTag}</strong></td>
              <td>{record.date}</td>
              <td>{record.issue}</td>
              <td>{record.treatment}</td>
              <td>{record.veterinarian}</td>
              <td>
                <StatusBadge className={record.status}>
                  {record.status}
                </StatusBadge>
              </td>
              <td>{record.followUp}</td>
              <td>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <ActionButton className="primary">
                    <FiEye />
                    View
                  </ActionButton>
                  <ActionButton className="secondary">
                    <FiEdit />
                    Update
                  </ActionButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableContainer>
  );

  const getFilterOptions = () => {
    switch (activeTab) {
      case 'livestock':
        return [
          { value: 'all', label: 'All Animals' },
          { value: 'healthy', label: 'Healthy' },
          { value: 'sick', label: 'Sick' },
          { value: 'recovering', label: 'Recovering' },
          { value: 'quarantine', label: 'Quarantine' }
        ];
      case 'vaccinations':
        return [
          { value: 'all', label: 'All Vaccines' },
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'overdue', label: 'Overdue' },
          { value: 'completed', label: 'Completed' }
        ];
      default:
        return [{ value: 'all', label: 'All Records' }];
    }
  };

  return (
    <FarmContainer>
      <Header>
        <h1>
          <FiHome className="farm-icon" />
          Farm Management Dashboard
        </h1>
        <p>
          Comprehensive livestock tracking, health monitoring, and farm management tools 
          to optimize your farm operations and animal welfare.
        </p>
      </Header>

      <StatsGrid>
        <StatCard gradient="#28a745, #20c997">
          <FiUsers className="stat-icon" />
          <div className="stat-number">{farmStats.totalAnimals}</div>
          <div className="stat-label">Total Animals</div>
          <div className="stat-trend">
            <FiTrendingUp />
            +{farmStats.monthlyGrowth} this month
          </div>
        </StatCard>

        <StatCard gradient="#17a2b8, #138496">
          <FiActivity className="stat-icon" />
          <div className="stat-number">{farmStats.healthyAnimals}</div>
          <div className="stat-label">Healthy Animals</div>
          <div className="stat-trend">
            <FiCheckCircle />
            {Math.round((farmStats.healthyAnimals / farmStats.totalAnimals) * 100)}% healthy
          </div>
        </StatCard>

        <StatCard gradient="#ffc107, #e0a800">
          <FiAlertTriangle className="stat-icon" />
          <div className="stat-number">{farmStats.sickAnimals}</div>
          <div className="stat-label">Need Attention</div>
          <div className="stat-trend">
            <FiClock />
            {farmStats.quarantineAnimals} in quarantine
          </div>
        </StatCard>

        <StatCard gradient="#dc3545, #c82333">
          <FiCalendar className="stat-icon" />
          <div className="stat-number">{farmStats.overdueVaccinations}</div>
          <div className="stat-label">Overdue Vaccines</div>
          <div className="stat-trend">
            <FiClock />
            {farmStats.upcomingVaccinations} upcoming
          </div>
        </StatCard>
      </StatsGrid>

      <DashboardGrid>
        <MainContent>
          <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="card-header">
              <div className="card-title">
                <FiBarChart className="card-icon" />
                Farm Records Management
              </div>
              <div className="card-actions">
                <ActionButton className="primary">
                  <FiPlus />
                  Add New
                </ActionButton>
                <ActionButton className="secondary">
                  <FiDownload />
                  Export
                </ActionButton>
              </div>
            </div>

            <TabContainer>
              <div className="tab-buttons">
                <button
                  className={`tab-button ${activeTab === 'livestock' ? 'active' : ''}`}
                  onClick={() => setActiveTab('livestock')}
                >
                  <FiUsers style={{ marginRight: '6px' }} />
                  Livestock
                </button>
                <button
                  className={`tab-button ${activeTab === 'vaccinations' ? 'active' : ''}`}
                  onClick={() => setActiveTab('vaccinations')}
                >
                  <FiCalendar style={{ marginRight: '6px' }} />
                  Vaccinations
                </button>
                <button
                  className={`tab-button ${activeTab === 'health' ? 'active' : ''}`}
                  onClick={() => setActiveTab('health')}
                >
                  <FiActivity style={{ marginRight: '6px' }} />
                  Health Records
                </button>
              </div>

              <SearchBar>
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchBar>

              <FilterBar>
                <FiFilter />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                >
                  {getFilterOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FilterBar>

              {activeTab === 'livestock' && renderLivestockTable()}
              {activeTab === 'vaccinations' && renderVaccinationTable()}
              {activeTab === 'health' && renderHealthRecordsTable()}
            </TabContainer>
          </Card>
        </MainContent>

        <Sidebar>
          <Card
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="card-header">
              <div className="card-title">
                <FiAlertTriangle className="card-icon" />
                Alerts & Reminders
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                padding: '12px',
                background: 'rgba(220, 53, 69, 0.1)',
                borderRadius: '8px',
                borderLeft: '4px solid #dc3545'
              }}>
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                  Vaccination Overdue
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  COW-002 needs Anthrax vaccine (5 days overdue)
                </div>
              </div>

              <div style={{
                padding: '12px',
                background: 'rgba(255, 193, 7, 0.1)',
                borderRadius: '8px',
                borderLeft: '4px solid #ffc107'
              }}>
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                  Health Checkup Due
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  3 animals need routine checkups this week
                </div>
              </div>

              <div style={{
                padding: '12px',
                background: 'rgba(40, 167, 69, 0.1)',
                borderRadius: '8px',
                borderLeft: '4px solid #28a745'
              }}>
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                  Recovery Update
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  COW-002 showing improvement, follow-up scheduled
                </div>
              </div>
            </div>
          </Card>

          <Card
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="card-header">
              <div className="card-title">
                <FiPieChart className="card-icon" />
                Quick Stats
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                <span style={{ color: '#666', fontSize: '14px' }}>Average Weight</span>
                <span style={{ fontWeight: '600', color: 'var(--dark-gray)' }}>
                  {farmStats.avgWeight} kg
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                <span style={{ color: '#666', fontSize: '14px' }}>Health Rate</span>
                <span style={{ fontWeight: '600', color: '#28a745' }}>
                  {Math.round((farmStats.healthyAnimals / farmStats.totalAnimals) * 100)}%
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                <span style={{ color: '#666', fontSize: '14px' }}>Vaccination Rate</span>
                <span style={{ fontWeight: '600', color: '#17a2b8' }}>
                  85%
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                <span style={{ color: '#666', fontSize: '14px' }}>Growth This Month</span>
                <span style={{ fontWeight: '600', color: 'var(--primary-coral)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiTrendingUp />
                  +{farmStats.monthlyGrowth}
                </span>
              </div>
            </div>
          </Card>

          <Card
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="card-header">
              <div className="card-title">
                <FiCalendar className="card-icon" />
                This Week's Schedule
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 0',
                borderBottom: '1px solid #e9ecef'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#28a745'
                }}></div>
                <div style={{ fontSize: '13px', flex: 1 }}>
                  <div style={{ fontWeight: '500' }}>Routine Health Checks</div>
                  <div style={{ color: '#666', fontSize: '11px' }}>Today, 10:00 AM</div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 0',
                borderBottom: '1px solid #e9ecef'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#ffc107'
                }}></div>
                <div style={{ fontSize: '13px', flex: 1 }}>
                  <div style={{ fontWeight: '500' }}>FMD Vaccinations</div>
                  <div style={{ color: '#666', fontSize: '11px' }}>Tomorrow, 2:00 PM</div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 0'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#17a2b8'
                }}></div>
                <div style={{ fontSize: '13px', flex: 1 }}>
                  <div style={{ fontWeight: '500' }}>Vet Visit - Dr. Smith</div>
                  <div style={{ color: '#666', fontSize: '11px' }}>Friday, 11:00 AM</div>
                </div>
              </div>
            </div>
          </Card>
        </Sidebar>
      </DashboardGrid>
    </FarmContainer>
  );
};

export default FarmManagementPage;