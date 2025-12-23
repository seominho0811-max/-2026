
export interface AdmissionData {
  id: string;
  studentName: string;
  studentInfo: string; // "반 번호"
  region: string;
  university: string;
  major: string;
  type: string;
  gpa: number;
  status: '합격' | '충원합격' | '불합';
}

export interface DashboardStats {
  totalCount: number;
  passInitial: number;
  passWaiting: number;
  failCount: number;
  passRate: number;
}
