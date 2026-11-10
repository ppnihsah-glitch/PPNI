export type CategoryType = 'TADIKA' | 'SEKOLAH_RENDAH';

export interface Participant {
  id: string; // T001 or R001
  bil: number;
  name: string;
  parentName: string;
  phone: string;
  school: string;
  age: string;
  category: CategoryType;
  attended: boolean;
  attendedAt?: string;
  replacementPaperUsed?: boolean;
  replacementPaperReason?: string;
}

export interface CriteriaBreakdown {
  kreativiti: number; // Max 25
  kombinasiWarna: number; // Max 25
  kekemasan: number; // Max 30
  persembahan: number; // Max 20
}

export interface JuryScore {
  id: string;
  participantId: string;
  category: CategoryType;
  juryId: string;
  juryName: string;
  criteria: CriteriaBreakdown;
  totalScore: number; // 0 - 100
  notes?: string;
  submittedAt: string;
}

export interface JuryMember {
  id: string; // JUR-01, JUR-02
  name: string;
  role: string;
  pin: string;
}

export interface RankedParticipant {
  participantId: string;
  category: CategoryType;
  attended: boolean;
  // For Admin view, name is visible; for Jury view, name is hidden
  name?: string;
  school?: string;
  scores: JuryScore[];
  averageTotal: number;
  avgKekemasan: number;
  avgKreativiti: number;
  avgKombinasi: number;
  avgPersembahan: number;
  rank: number;
  tieBrokenBy?: string;
}

export type ActiveRole = 'parent' | 'jury' | 'admin' | 'specification';
