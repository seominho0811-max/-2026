
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend
} from 'recharts';
import { 
  Search, CheckCircle2, XCircle, TrendingUp, FolderOpen, 
  Loader2, Sparkles, ChevronDown, GraduationCap, User
} from 'lucide-react';
import { AdmissionData, DashboardStats } from './types';
import { fetchAdmissionsData } from './services/dataService';
import { generateDataInsights } from './services/geminiService';
import { SummaryCard } from './components/SummaryCard';

const App: React.FC = () => {
  const [data, setData] = useState<AdmissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [aiInsight, setAiInsight] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const fetchedData = await fetchAdmissionsData();
      setData(fetchedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAiAnalysis = async () => {
    if (data.length === 0) return;
    setAnalyzing(true);
    const insight = await generateDataInsights(data);
    setAiInsight(insight);
    setAnalyzing(false);
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = 
        item.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.studentName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = selectedRegion === '전체' || item.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [data, searchTerm, selectedRegion]);

  const stats = useMemo<DashboardStats>(() => {
    const totalCount = filteredData.length;
    const passInitial = filteredData.filter(d => d.status === '합격').length;
    const passWaiting = filteredData.filter(d => d.status === '충원합격').length;
    const failCount = filteredData.filter(d => d.status === '불합').length;
    const passRate = totalCount > 0 ? Number(((passInitial + passWaiting) / totalCount * 100).toFixed(1)) : 0;

    return { totalCount, passInitial, passWaiting, failCount, passRate };
  }, [filteredData]);

  const chartData = useMemo(() => {
    const categories = [
      { key: '교과', label: '교과' },
      { key: '종합', label: '종합' },
      { key: '실기', label: '실기' }
    ];
    
    return categories.map(cat => {
      const group = filteredData.filter(d => d.type.includes(cat.key));
      return {
        name: cat.label,
        '불합': group.filter(d => d.status === '불합').length,
        '충원합격': group.filter(d => d.status === '충원합격').length,
        '합격': group.filter(d => d.status === '합격').length,
      };
    });
  }, [filteredData]);

  const regionList = useMemo(() => {
    return ['전체', ...Array.from(new Set(data.map(d => d.region))).sort()];
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">실시간 데이터를 분석하고 있습니다...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 px-6 lg:px-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[32px] font-bold text-slate-900 flex items-center gap-3">
            <span className="text-indigo-600 font-extrabold italic"><GraduationCap className="inline w-9 h-9" /> 2026학년도</span> 대입 수시 결과 대시보드
          </h1>
          <p className="text-slate-400 mt-1 font-medium">학생별, 전형별 합격 데이터를 실시간으로 분석합니다.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="대학, 학과, 이름 검색..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <SummaryCard 
          title="검색 결과 지원 건수" 
          value={`${stats.totalCount}건`} 
          description="전체 지원 데이터"
          icon={<FolderOpen className="w-6 h-6" />}
          iconBg="bg-indigo-500"
        />
        <SummaryCard 
          title="합격 건수" 
          value={`${stats.passInitial + stats.passWaiting}건`} 
          subValue={`합격: ${stats.passInitial} / 충원합: ${stats.passWaiting}`}
          description="최종 합격 추정 데이터"
          icon={<CheckCircle2 className="w-6 h-6" />}
          iconBg="bg-emerald-500"
        />
        <SummaryCard 
          title="불합격 건수" 
          value={`${stats.failCount}건`} 
          description="해당 조건 내 불합격"
          icon={<XCircle className="w-6 h-6" />}
          iconBg="bg-rose-500"
        />
        <SummaryCard 
          title="검색 조건 합격률" 
          value={`${stats.passRate}%`} 
          description="조건별 합격 비중"
          icon={<TrendingUp className="w-6 h-6" />}
          iconBg="bg-amber-500"
        />
      </div>

      <div className="mb-10">
        <button 
          onClick={handleAiAnalysis}
          disabled={analyzing}
          className="flex items-center gap-2 bg-white border border-indigo-100 text-indigo-600 px-6 py-3 rounded-2xl font-bold shadow-soft hover:bg-indigo-50 transition-all disabled:opacity-50"
        >
          {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          Gemini AI 리포트 생성하기
        </button>
        {aiInsight && (
          <div className="mt-4 bg-white p-8 rounded-[32px] shadow-soft border border-indigo-50 animate-in fade-in slide-in-from-top-4 duration-500">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="text-indigo-500 w-6 h-6" /> AI 분석 리포트
            </h2>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
              {aiInsight}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 bg-white rounded-[32px] p-8 shadow-soft border border-slate-50">
          <h3 className="text-[18px] font-bold text-slate-800 mb-10">전형유형별 분포 (교과·종합·실기)</h3>
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="top" align="center" iconType="rect" wrapperStyle={{ paddingBottom: '30px' }} />
                <Bar dataKey="불합" stackId="a" fill="#f43f5e" barSize={40} />
                <Bar dataKey="충원합격" stackId="a" fill="#3b82f6" barSize={40} />
                <Bar dataKey="합격" stackId="a" fill="#10b981" barSize={40} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-300 mt-6 text-center italic">* 검색어 및 지역 필터가 적용된 수치입니다.</p>
        </div>

        <div className="lg:col-span-8 bg-white rounded-[32px] p-8 shadow-soft border border-slate-50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[18px] font-bold text-slate-800 flex items-center gap-2">
              <User className="text-indigo-400 w-5 h-5" /> 상세 지원 현황
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 font-medium">지역 필터</span>
              <div className="relative">
                <select 
                  className="pl-4 pr-10 py-2 bg-[#f8fafc] border border-slate-100 rounded-xl text-sm font-medium outline-none appearance-none cursor-pointer text-slate-600"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  {regionList.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 text-[12px] font-semibold border-b border-slate-50">
                  <th className="pb-4 pl-2">학생 정보</th>
                  <th className="pb-4">대학 / 학과</th>
                  <th className="pb-4">전형 유형</th>
                  <th className="pb-4 text-center">내신</th>
                  <th className="pb-4 text-right pr-4">결과</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.slice(0, 100).map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-6 pl-2">
                      <div className="flex flex-col">
                        <span className="text-[15px] font-bold text-slate-800">{item.studentName}</span>
                        <span className="text-[12px] text-slate-400">{item.studentInfo}</span>
                      </div>
                    </td>
                    <td className="py-6">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 font-bold uppercase">{item.region}</span>
                          <span className="text-[15px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {item.university}
                          </span>
                        </div>
                        <span className="text-[13px] text-slate-400 mt-0.5">{item.major}</span>
                      </div>
                    </td>
                    <td className="py-6">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-semibold text-slate-700">{item.type}</span>
                        <span className="text-[11px] text-slate-400 mt-0.5">수시모집 현황</span>
                      </div>
                    </td>
                    <td className="py-6 text-center">
                      <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        {item.gpa.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-6 text-right pr-2">
                      <span className={`
                        px-4 py-1.5 rounded-full text-[12px] font-bold
                        ${item.status === '합격' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : ''}
                        ${item.status === '충원합격' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : ''}
                        ${item.status === '불합' ? 'bg-rose-50 text-rose-600 border border-rose-100' : ''}
                      `}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredData.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center">
              <Search className="w-12 h-12 text-slate-100 mb-4" />
              <p className="text-slate-400 font-medium italic">일치하는 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
