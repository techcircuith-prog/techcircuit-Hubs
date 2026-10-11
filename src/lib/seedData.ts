import { Company, Skill, Opportunity, Project, Resource, LearningPath, ScoringConfig } from '../types';
import { ECE_LAB_PROJECTS } from './eceLabProjects';

// Official ECE Specialization & Skill Disciplines (Curriculum Standard)
export const INITIAL_SKILLS: Omit<Skill, 'id'>[] = [
  { name: 'Embedded C', category: 'Embedded' },
  { name: 'Arduino', category: 'Embedded' },
  { name: 'Raspberry Pi', category: 'Embedded' },
  { name: 'IoT', category: 'Embedded' },
  { name: 'Verilog', category: 'VLSI' },
  { name: 'VHDL', category: 'VLSI' },
  { name: 'VLSI', category: 'VLSI' },
  { name: 'FPGA', category: 'VLSI' },
  { name: 'PCB Design', category: 'Circuits' },
  { name: 'Analog Circuits', category: 'Circuits' },
  { name: 'Digital Electronics', category: 'Circuits' },
  { name: 'DSP', category: 'Signal Processing' },
  { name: 'MATLAB', category: 'Software/Tools' },
  { name: 'Python', category: 'Software/Tools' },
  { name: 'Communication Systems', category: 'Communication' },
  { name: 'Antenna Design', category: 'Communication' },
  { name: 'Signal Processing', category: 'Signal Processing' },
  { name: 'RF Engineering', category: 'Communication' },
  { name: 'Robotics', category: 'Embedded' },
  { name: 'ARM Cortex', category: 'Embedded' },
  { name: 'RTOS', category: 'Embedded' },
];

// Official 42 ECE & PCB Lab Hardware Projects
export const INITIAL_PROJECTS: Omit<Project, 'id' | 'createdAt'>[] = ECE_LAB_PROJECTS;

// Pure client-ready state: No mock companies, opportunities, resources, or paths
export const INITIAL_COMPANIES: Omit<Company, 'id'>[] = [];
export const INITIAL_OPPORTUNITIES: Omit<Opportunity, 'id' | 'createdAt'>[] = [];
export const INITIAL_RESOURCES: Omit<Resource, 'id' | 'createdAt'>[] = [];
export const INITIAL_LEARNING_PATHS: Omit<LearningPath, 'id' | 'createdAt'>[] = [];

export const DEFAULT_SCORING: ScoringConfig = {
  applied: 10,
  shortlisted: 5,
  completed: 30,
  certificateUploaded: 10,
  projectPurchased: 10,
  resourceCompleted: 5,
  dailyResourceCap: 3,
};
