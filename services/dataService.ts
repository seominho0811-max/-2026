
import { AdmissionData } from '../types';

const SPREADSHEET_ID = '1UUPQAt7sRay4XhGTiacPKpL0jRxwCs9oUP2PB6HnVvI';
const SHEET_NAME = '2026수시';
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&tq=select *`;

export async function fetchAdmissionsData(): Promise<AdmissionData[]> {
  try {
    const response = await fetch(BASE_URL);
    const text = await response.text();
    
    const jsonString = text.match(/google\.visualization\.Query\.setResponse\(([\s\S\w]+)\)/);
    if (!jsonString || !jsonString[1]) {
      throw new Error('Invalid response format');
    }
    
    const data = JSON.parse(jsonString[1]);
    const rows = data.table.rows;
    
    return rows.map((row: any, index: number) => {
      const getVal = (idx: number) => row.c[idx]?.v ?? '';
      const getNum = (idx: number) => {
        const val = row.c[idx]?.v;
        return typeof val === 'number' ? val : 0;
      };

      const name = getVal(3).toString();
      const classNo = getVal(1).toString();
      const studentNo = getVal(2).toString();
      const region = getVal(5).toString();
      const univ = getVal(6).toString();
      const type = getVal(8).toString();
      const major = getVal(10).toString();
      const gpa = getNum(11);
      const resultVal = getVal(12).toString();

      let status: '합격' | '충원합격' | '불합' = '불합';
      if (resultVal.includes('최초') || resultVal === '합격') {
        status = '합격';
      } else if (resultVal.includes('충원')) {
        status = '충원합격';
      } else {
        status = '불합';
      }

      return {
        id: `row-${index}`,
        studentName: name,
        studentInfo: `${classNo}반 ${studentNo}번`,
        region: region,
        university: univ,
        major: major,
        type: type,
        gpa: gpa,
        status: status
      };
    }).filter((item: AdmissionData) => item.studentName && item.studentName !== '이름');
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
