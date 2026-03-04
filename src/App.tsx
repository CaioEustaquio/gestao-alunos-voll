import React, { useState } from 'react';
import { Download, FileText, Table as TableIcon, GraduationCap, Search, User, Sparkles, X, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

// Define types
interface Student {
  id: number;
  name: string;
  email: string;
  lesson: string;
  status: 'Active' | 'Inactive' | 'Pending';
}

// Mock data: 20 students
const initialStudents: Student[] = [
  { id: 1, name: 'Ana Silva', email: 'ana.silva@example.com', lesson: 'Pilates Solo', status: 'Active' },
  { id: 2, name: 'Bruno Santos', email: 'bruno.santos@example.com', lesson: 'Pilates Reformer', status: 'Active' },
  { id: 3, name: 'Carla Oliveira', email: 'carla.oliveira@example.com', lesson: 'Pilates Cadillac', status: 'Active' },
  { id: 4, name: 'Diego Ferreira', email: 'diego.ferreira@example.com', lesson: 'Pilates Chair', status: 'Inactive' },
  { id: 5, name: 'Elena Costa', email: 'elena.costa@example.com', lesson: 'Pilates Barrel', status: 'Active' },
  { id: 6, name: 'Felipe Rocha', email: 'felipe.rocha@example.com', lesson: 'Pilates para Gestantes', status: 'Pending' },
  { id: 7, name: 'Gabriela Lima', email: 'gabriela.lima@example.com', lesson: 'Pilates para Idosos', status: 'Active' },
  { id: 8, name: 'Hugo Almeida', email: 'hugo.almeida@example.com', lesson: 'Pilates Clínico', status: 'Active' },
  { id: 9, name: 'Isabela Souza', email: 'isabela.souza@example.com', lesson: 'Pilates Aéreo', status: 'Active' },
  { id: 10, name: 'João Pereira', email: 'joao.pereira@example.com', lesson: 'Pilates com Bola', status: 'Inactive' },
  { id: 11, name: 'Karen Martins', email: 'karen.martins@example.com', lesson: 'Pilates Funcional', status: 'Active' },
  { id: 12, name: 'Lucas Gomes', email: 'lucas.gomes@example.com', lesson: 'Pilates Power', status: 'Active' },
  { id: 13, name: 'Mariana Ribeiro', email: 'mariana.ribeiro@example.com', lesson: 'Pilates Flow', status: 'Pending' },
  { id: 14, name: 'Nicolas Carvalho', email: 'nicolas.carvalho@example.com', lesson: 'Pilates Core', status: 'Active' },
  { id: 15, name: 'Olivia Mendes', email: 'olivia.mendes@example.com', lesson: 'Pilates Postural', status: 'Active' },
  { id: 16, name: 'Pedro Barbosa', email: 'pedro.barbosa@example.com', lesson: 'Pilates de Reabilitação', status: 'Active' },
  { id: 17, name: 'Queila Xavier', email: 'queila.xavier@example.com', lesson: 'Pilates Mat', status: 'Inactive' },
  { id: 18, name: 'Rafael Nunes', email: 'rafael.nunes@example.com', lesson: 'Pilates Relax', status: 'Active' },
  { id: 19, name: 'Sofia Castro', email: 'sofia.castro@example.com', lesson: 'Pilates Kids', status: 'Active' },
  { id: 20, name: 'Tiago Lopes', email: 'tiago.lopes@example.com', lesson: 'Pilates Avançado', status: 'Pending' },
];

export default function App() {
  const [students] = useState<Student[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<{ name: string, description: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lesson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateAISummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const activeCount = students.filter(s => s.status === 'Active').length;
      const totalCount = students.length;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Com base nos dados: Total de alunos: ${totalCount}, Alunos ativos: ${activeCount}. Crie uma frase curta e motivadora em português confirmando a quantidade de alunos ativos e incentivando a gestão. Seja breve (máximo 2 linhas).`,
      });
      setAiSummary(response.text || `Atualmente temos ${activeCount} alunos ativos em nossa plataforma.`);
    } catch (error) {
      console.error("Erro ao gerar resumo IA:", error);
      const activeCount = students.filter(s => s.status === 'Active').length;
      setAiSummary(`Temos ${activeCount} alunos ativos no momento.`);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  React.useEffect(() => {
    generateAISummary();
  }, []);

  const translateStatus = (status: string) => {
    switch (status) {
      case 'Active': return 'Ativo';
      case 'Inactive': return 'Inativo';
      case 'Pending': return 'Pendente';
      default: return status;
    }
  };

  const generateDescription = async (lesson: string) => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Descreva brevemente o que é a aula de "${lesson}" no contexto de Pilates. Explique os benefícios e o que o aluno pode esperar. Responda em português de forma profissional e acolhedora em no máximo 5 linhas de texto.`,
      });
      setSelectedLesson({ name: lesson, description: response.text || "Não foi possível gerar uma descrição no momento." });
    } catch (error) {
      console.error("Erro ao gerar descrição:", error);
      setSelectedLesson({ name: lesson, description: "Ocorreu um erro ao conectar com o assistente de IA. Por favor, tente novamente mais tarde." });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportCSV = () => {
    const dataToExport = filteredStudents.map(s => ({
      ID: s.id,
      Nome: s.name,
      Email: s.email,
      Aula: s.lesson,
      Status: translateStatus(s.status)
    }));
    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'lista_alunos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Lista de Alunos', 14, 15);
    
    const tableColumn = ["ID", "Nome", "E-mail", "Aula", "Status"];
    const tableRows = filteredStudents.map(student => [
      student.id,
      student.name,
      student.email,
      student.lesson,
      translateStatus(student.status)
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
    });

    doc.save('lista_alunos.pdf');
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 p-4 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <GraduationCap size={24} />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">Gestão de Alunos</h1>
            </div>
            <p className="text-zinc-500">Gerencie e exporte os registros de seus alunos com facilidade.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportCSV}
              id="export-csv-btn"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl shadow-sm hover:bg-zinc-50 transition-colors text-sm font-medium"
            >
              <TableIcon size={18} className="text-emerald-600" />
              Exportar CSV
            </button>
            <button
              onClick={exportPDF}
              id="export-pdf-btn"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl shadow-sm hover:bg-zinc-50 transition-colors text-sm font-medium"
            >
              <FileText size={18} className="text-rose-600" />
              Exportar PDF
            </button>
          </div>
        </header>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou aula..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Total de Alunos</p>
              <p className="text-2xl font-semibold">{filteredStudents.length}</p>
            </div>
            <div className="p-3 bg-zinc-100 rounded-xl text-zinc-600">
              <User size={20} />
            </div>
          </div>
        </div>

        {/* AI Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center gap-4"
        >
          <div className="p-2 bg-indigo-600 rounded-xl text-white shrink-0">
            <Sparkles size={18} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-0.5">Insight do Assistente IA</p>
            {isGeneratingSummary ? (
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Loader2 size={14} className="animate-spin" />
                <span>Analisando dados dos alunos...</span>
              </div>
            ) : (
              <p className="text-sm text-zinc-700 font-medium">{aiSummary}</p>
            )}
          </div>
        </motion.div>

        {/* Table Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-bottom border-zinc-100 bg-zinc-50/50">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">ID</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Aluno</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Aula</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 text-right">Descrição</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <AnimatePresence mode="popLayout">
                  {filteredStudents.map((student) => (
                    <motion.tr
                      key={student.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-zinc-50/80 transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-zinc-400">#{student.id.toString().padStart(3, '0')}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-zinc-900">{student.name}</span>
                          <span className="text-xs text-zinc-500">{student.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600">{student.lesson}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                          student.status === 'Inactive' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {translateStatus(student.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => generateDescription(student.lesson)}
                          disabled={isGenerating}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Descrever aula com IA"
                        >
                          <Sparkles size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                      Nenhum aluno encontrado correspondente à sua busca.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* AI Description Modal */}
        <AnimatePresence>
          {selectedLesson && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
              >
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-indigo-50/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-xl text-white">
                      <Sparkles size={20} />
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-900">{selectedLesson.name}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-8">
                  <div className="prose prose-zinc max-w-none">
                    {selectedLesson.description.split('\n').map((para, i) => (
                      para.trim() && <p key={i} className="text-zinc-600 leading-relaxed mb-4">{para}</p>
                    ))}
                  </div>
                </div>
                <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end">
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="px-6 py-2 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isGenerating && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl shadow-xl border border-zinc-100"
              >
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-sm font-medium text-zinc-600">Assistente IA gerando descrição...</p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-400">
          <p>© 2026 Sistema de Gestão de Alunos. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-600 transition-colors">Política de Privacidade</a>
            <a href="#" className="hover:text-zinc-600 transition-colors">Termos de Serviço</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
