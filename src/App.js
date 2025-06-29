Visão Geral
O problema era um erro de sintaxe no ficheiro App.js. Uma função do Firebase (getDocs) não estava a ser importada, e um parâmetro (onModalAction) não estava a ser passado corretamente para todos os componentes que precisavam dele. A versão abaixo corrige estes dois problemas.

Etapa 1: A Correção Final (no seu computador)
Você só precisa de atualizar um ficheiro.

Abra o ficheiro src/App.js na pasta do seu projeto.

Apague todo o conteúdo e substitua-o por esta versão final e corrigida:

import React, { useState, useEffect } from 'react';
// FIX: Added 'getDocs' to the import list
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, onSnapshot, serverTimestamp, getDocs } from 'firebase/firestore';
import { Dumbbell, UtensilsCrossed, TrendingUp, User, Flame, Droplet, HeartPulse, BrainCircuit, CheckCircle, Target, Sun, Moon, Sparkles, Bot, LogOut, Video } from 'lucide-react';

// --- INÍCIO DA CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyAhQh60godGhLrNLIFPvDUujupk_RXlhSA",
  authDomain: "vitapersonal-35aa7.firebaseapp.com",
  projectId: "vitapersonal-35aa7",
  storageBucket: "vitapersonal-35aa7.appspot.com",
  messagingSenderId: "407585522071",
  appId: "1:407585522071:web:b0dcfba88124a570ad84d2",
  measurementId: "G-YYPZLH5JF1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// --- FIM DA CONFIGURAÇÃO DO FIREBASE ---

// --- FUNÇÃO DE CHAMADA DA API GEMINI ---
async function callGemini(prompt) {
    const apiKey = ""; // Deixar em branco
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
    };
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        const result = await response.json();
        if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            console.warn("Gemini response is not in the expected format:", result);
            if (result.candidates && result.candidates[0]?.finishReason === 'SAFETY') {
                return "A resposta foi bloqueada por razões de segurança. Por favor, tente um prompt diferente.";
            }
            return "Não foi possível obter uma resposta da IA. Tente novamente.";
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Ocorreu um erro ao comunicar com a IA. Verifique sua conexão ou tente mais tarde.";
    }
}

// --- DADOS DO GUIA (Exercícios, Alimentos) ---
const exercises = {
    calisthenics: [
        { name: "Agachamento", sets: "3", reps: "8-12", group: "Pernas e Glúteos", desc: "Mantenha as costas retas e desça como se fosse sentar." },
        { name: "Flexão de Braço", sets: "3", reps: "Até a falha", group: "Peito, Ombros, Tríceps", desc: "Corpo em linha reta. Se necessário, comece com os joelhos no chão." },
        { name: "Remada Invertida", sets: "3", reps: "8-12", group: "Costas e Bíceps", desc: "Use uma mesa ou barra baixa. Puxe o peito em direção à barra." },
        { name: "Prancha Abdominal", sets: "3", reps: "30-60s", group: "Core", desc: "Mantenha o corpo reto, contraindo abdômen e glúteos." },
        { name: "Afundo", sets: "3", reps: "8-12 por perna", group: "Pernas e Glúteos", desc: "Dê um passo à frente e desça até os joelhos dobrarem 90 graus." },
        { name: "Mergulho no Banco", sets: "3", reps: "8-12", group: "Tríceps", desc: "Use uma cadeira estável. Baixe o corpo dobrando os cotovelos." }
    ],
    cardio: {
        beginner: "Caminhada Rápida ou Corrida Leve",
        duration: "30-45 minutos"
    }
};

const weeklySchedule = {
    1: { type: "Força", details: exercises.calisthenics },
    2: { type: "Cardio", details: exercises.cardio },
    3: { type: "Força", details: exercises.calisthenics },
    4: { type: "Cardio", details: exercises.cardio },
    5: { type: "Força", details: exercises.calisthenics },
    6: { type: "Descanso Ativo", details: { name: "Caminhada Leve", duration: "30 min" } },
    0: { type: "Descanso", details: null } // Domingo
};

const foodList = {
    Proteínas: ["Ovos", "Peito de Frango", "Feijão", "Lentilha", "Atum em Lata", "Iogurte Natural", "Cortes de carne económicos (acém, patinho)"],
    "Carboidratos Complexos": ["Arroz Integral", "Batata-doce", "Mandioca (Aipim)", "Inhame", "Aveia em flocos", "Pão Integral"],
    "Gorduras Saudáveis": ["Amendoim", "Pasta de amendoim integral", "Azeite de oliva", "Abacate"],
    "Legumes e Verduras": ["Folhas verdes (alface, couve)", "Brócolis", "Couve-flor", "Cenoura", "Tomate", "Cebola", "Abóbora"],
    Frutas: ["Banana", "Maçã", "Laranja", "Mamão", "Melancia", "Abacaxi"]
};

// --- COMPONENTES DA UI ---
const LoginScreen = ({ onLogin }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 text-white">
        <div className="text-center">
            <BrainCircuit className="w-24 h-24 mx-auto text-cyan-400 mb-4"/>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Bem-vindo ao appvitapersonal</h1>
            <p className="text-lg text-gray-300 mb-8">Seu assistente inteligente de fitness e nutrição.</p>
            <button
                onClick={onLogin}
                className="flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-200 transition-all transform hover:scale-105"
            >
                <img src="https://www.google.com/favicon.ico" alt="Google icon" className="w-6 h-6"/>
                Entrar com o Google
            </button>
        </div>
    </div>
);

const GeminiModal = ({ isOpen, onClose, title, content, isLoading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2"><Sparkles /> {title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center gap-3 text-white h-40">
                        <Bot className="w-10 h-10 animate-pulse text-cyan-500" />
                        <span>A IA está trabalhando para você...</span>
                    </div>
                ) : (
                    <div className="prose prose-invert max-w-none prose-p:my-2 prose-headings:text-cyan-300 prose-strong:text-white">
                        <pre className="whitespace-pre-wrap font-sans text-white">{content}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

const Header = ({ user, onNavigate, onLogout, activeView }) => {
    const navItems = [
        { id: 'dashboard', label: 'Painel', icon: <Sun className="w-5 h-5" /> },
        { id: 'workout', label: 'Treino', icon: <Dumbbell className="w-5 h-5" /> },
        { id: 'nutrition', label: 'Nutrição', icon: <UtensilsCrossed className="w-5 h-5" /> },
        { id: 'progress', label: 'Progresso', icon: <TrendingUp className="w-5 h-5" /> },
    ];
    return (
        <header className="bg-gray-800 text-white p-3 shadow-md sticky top-0 z-20">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <BrainCircuit className="w-8 h-8 text-cyan-400"/>
                    <h1 className="hidden sm:block text-xl md:text-2xl font-bold">appvitapersonal</h1>
                </div>
                <nav className="hidden md:flex items-center space-x-1">
                    {navItems.map(item => (
                         <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200 ${
                                activeView === item.id ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
                 <div className="md:hidden">
                    <select
                        onChange={(e) => onNavigate(e.target.value)}
                        value={activeView}
                        className="bg-gray-700 text-white p-2 rounded-md"
                    >
                        {navItems.map(item => (
                            <option key={item.id} value={item.id}>{item.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => onNavigate('profile')} className="flex items-center gap-2 text-sm">
                        <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full border-2 border-cyan-500" />
                        <span className="hidden lg:inline">{user.displayName.split(' ')[0]}</span>
                    </button>
                    <button onClick={onLogout} className="p-2 rounded-md hover:bg-red-500 transition-colors" title="Sair">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

const ProfileSetup = ({ onSave, initialData, isEditing = false }) => {
    const [formData, setFormData] = useState(initialData || { age: '', weight: '', height: '', activityLevel: '1.375' });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-2xl text-white">
                <div className="text-center mb-8">
                    <User className="w-16 h-16 mx-auto text-cyan-400 mb-4"/>
                    <h2 className="text-3xl font-bold">{isEditing ? 'Atualize seu Perfil' : 'Complete seu Perfil'}</h2>
                    <p className="text-gray-400 mt-2">{isEditing ? 'Ajuste seus dados para recalcular as metas.' : 'Só mais um passo! Precisamos desses dados para criar seu plano.'}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Idade</label>
                        <input type="number" name="age" value={formData.age} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-cyan-500" placeholder="Ex: 30" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Peso (kg)</label>
                        <input type="number" name="weight" value={formData.weight} onChange={handleChange} required step="0.1" className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-cyan-500" placeholder="Ex: 85.5" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Altura (cm)</label>
                        <input type="number" name="height" value={formData.height} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-cyan-500" placeholder="Ex: 175" />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-300 mb-1">Nível de Atividade</label>
                        <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-cyan-500">
                            <option value="1.2">Sedentário (pouco ou nenhum exercício)</option>
                            <option value="1.375">Levemente Ativo (1-3 dias/semana)</option>
                            <option value="1.55">Moderadamente Ativo (3-5 dias/semana)</option>
                            <option value="1.725">Muito Ativo (6-7 dias/semana)</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-md transition-transform transform hover:scale-105">
                        {isEditing ? 'Salvar Alterações' : 'Criar Meu Plano'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, unit, color }) => (
    <div className="bg-gray-700 p-4 rounded-lg shadow-lg flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-300">{title}</p>
            <p className="text-xl font-bold text-white">{value} <span className="text-base font-normal text-gray-400">{unit}</span></p>
        </div>
    </div>
);

const Dashboard = ({ user }) => {
    const today = new Date().getDay();
    const todayWorkout = weeklySchedule[today];
    const greeting = new Date().getHours() < 12 ? "Bom dia" : new Date().getHours() < 18 ? "Boa tarde" : "Boa noite";
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">{greeting}, {user.displayName.split(' ')[0]}!</h2>
             <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2"><Target /> Suas Metas Diárias</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={<Flame className="w-6 h-6"/>} title="Calorias" value={user.profile.calorieTarget} unit="kcal" color="bg-red-500"/>
                    <StatCard icon={<Dumbbell className="w-6 h-6"/>} title="Proteínas" value={user.profile.macros.protein} unit="g" color="bg-blue-500"/>
                    <StatCard icon={<BrainCircuit className="w-6 h-6"/>} title="Carboidratos" value={user.profile.macros.carbs} unit="g" color="bg-yellow-500"/>
                    <StatCard icon={<HeartPulse className="w-6 h-6"/>} title="Gorduras" value={user.profile.macros.fat} unit="g" color="bg-green-500"/>
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2"><Dumbbell /> Treino de Hoje: {todayWorkout.type}</h3>
                    {todayWorkout.type.includes("Força") ? (
                        <div className="space-y-2">
                             <p className="text-gray-300">Foco: Corpo Inteiro. Complete todos os exercícios.</p>
                             <div className="text-center mt-4">
                                <span className="text-sm font-medium bg-cyan-900 text-cyan-300 py-1 px-3 rounded-full">{todayWorkout.details.length} exercícios</span>
                             </div>
                        </div>
                    ) : todayWorkout.type.includes("Cardio") ? (
                        <p className="text-gray-300">{todayWorkout.details.beginner} por {todayWorkout.details.duration}.</p>
                    ) : (
                         <p className="text-gray-300">{todayWorkout.details ? `${todayWorkout.details.name} por ${todayWorkout.details.duration}` : "Descanse e recupere-se. O sono é crucial!"}</p>
                    )}
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2"><Droplet /> Dica de Hidratação</h3>
                     <p className="text-gray-300">
                        Beba água ao longo do dia. Um bom alvo é 35ml por kg de peso corporal. Para você: <span className="font-bold text-white">{(user.profile.weight * 35 / 1000).toFixed(1)} litros</span> por dia.
                    </p>
                </div>
            </div>
        </div>
    );
};

const WorkoutPlan = () => {
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const todayIndex = new Date().getDay();
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-4">Seu Plano de Treino Semanal</h2>
            <div className="space-y-4">
                {days.map((day, index) => {
                    const workout = weeklySchedule[index];
                    const isToday = index === todayIndex;
                    return (
                        <div key={day} className={`p-4 rounded-lg shadow-md transition-all ${isToday ? 'bg-cyan-900 border-2 border-cyan-500' : 'bg-gray-800'}`}>
                           <h3 className={`text-lg font-bold ${isToday ? 'text-cyan-300' : 'text-white'}`}>{day} - {workout.type} {isToday && <span className="text-xs ml-2 bg-cyan-500 text-white font-bold py-1 px-2 rounded-full">HOJE</span>}</h3>
                           {workout.type.includes("Força") && (
                               <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                   {workout.details.map(ex => (
                                       <div key={ex.name} className="bg-gray-700 p-3 rounded flex justify-between items-center">
                                           <div>
                                                <p className="font-semibold text-white">{ex.name}</p>
                                                <p className="text-sm text-gray-300">{ex.sets} séries x {ex.reps} reps</p>
                                           </div>
                                           <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' exercício com peso corporal')}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-red-500 transition-colors" title={`Ver vídeos de ${ex.name}`}>
                                               <Video className="w-6 h-6 text-white"/>
                                           </a>
                                       </div>
                                   ))}
                               </div>
                           )}
                           {workout.type.includes("Cardio") && (
                                <p className="mt-2 text-gray-300">{workout.details.beginner} por {workout.details.duration}.</p>
                           )}
                           {workout.type.includes("Descanso Ativo") && (
                                <p className="mt-2 text-gray-300">{workout.details.name} por {workout.details.duration}</p>
                           )}
                            {workout.type === "Descanso" && (
                                <p className="mt-2 text-gray-300">Recuperação total. Essencial para o crescimento muscular.</p>
                           )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const NutritionPlan = ({ onModalAction }) => {
    const handleGenerateRecipe = async () => {
        onModalAction('open', { type: 'recipe', isLoading: true });
        const availableFoods = [...foodList.Proteínas, ...foodList["Carboidratos Complexos"], ...foodList["Legumes e Verduras"]].join(', ');
        const prompt = `Crie uma receita de almoço simples, saudável e barata para uma pessoa que busca emagrecer e ganhar massa magra. A receita deve ser fácil de preparar. Use ingredientes comuns no Brasil, como alguns destes: ${availableFoods}. Apresente a resposta em markdown, com um título para a receita, uma lista de ingredientes e o modo de preparo.`;
        const generatedRecipe = await callGemini(prompt);
        onModalAction('update', { content: generatedRecipe, isLoading: false });
    };
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-4">Guia Nutricional Econômico</h2>
            <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-cyan-400 mb-3">Assistente de Receitas IA</h3>
                <p className="text-gray-300 mb-4">Sem inspiração? Deixe que a IA crie uma receita saudável para você com os alimentos do seu plano.</p>
                <button 
                    onClick={handleGenerateRecipe}
                    className="flex items-center justify-center gap-2 w-full md:w-auto bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-2 px-6 rounded-md transition-all"
                >
                    <Sparkles className="w-5 h-5"/>
                    ✨ Gerar Receita do Dia
                </button>
            </div>
            <p className="text-gray-300">Concentre-se em "comida de verdade". Use esta lista para montar suas refeições e marmitas, garantindo que você atinja suas metas de macros de forma barata e saudável.</p>
            {Object.entries(foodList).map(([category, items]) => (
                <div key={category} className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold text-cyan-400 mb-3">{category}</h3>
                    <div className="flex flex-wrap gap-2">
                        {items.map(item => (
                            <span key={item} className="bg-gray-700 text-white py-1 px-3 rounded-full text-sm">{item}</span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const ProgressTracker = ({ user, progress, onAddProgress, onModalAction }) => {
    const [formData, setFormData] = useState({ weight: user.profile.weight, waist: '' });
    useEffect(() => {
        setFormData(prev => ({ ...prev, weight: user.profile.weight }));
    }, [user.profile.weight]);
    const handleChange = e => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    };
    const handleSubmit = e => {
        e.preventDefault();
        onAddProgress(formData);
        setFormData({ weight: user.profile.weight, waist: '' });
    };
    const handleAnalyzeProgress = async () => {
        if (progress.length < 2) return;
        onModalAction('open', { type: 'analysis', isLoading: true });
        const sortedProgress = [...progress].sort((a,b) => new Date(a.date.seconds * 1000) - new Date(b.date.seconds * 1000));
        const progressString = sortedProgress.map(p => `Data: ${new Date(p.date.seconds * 1000).toLocaleDateString('pt-BR')}, Peso: ${p.weight}kg`).join('; ');

        const prompt = `Sou um homem de ${user.profile.age} anos tentando emagrecer. Meu peso alvo implícito é menor que o peso inicial. Meu histórico de peso recente é: ${progressString}. Com base nisso, escreva uma análise curta e uma mensagem motivacional em português do Brasil. Seja encorajador, mesmo que o progresso não seja linear. Finalize com uma dica prática e acionável para a próxima semana. Formate a resposta como um pequeno parágrafo de análise, seguido por "Dica da IA:" com a dica.`;
        const generatedAnalysis = await callGemini(prompt);
        onModalAction('update', { content: generatedAnalysis, isLoading: false });
    };
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-4">Acompanhamento de Progresso</h2>
            <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-cyan-400 mb-4">Adicionar Check-in Semanal</h3>
                 <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Peso Atual (kg)</label>
                        <input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                    </div>
                     <div className="w-full">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Cintura (cm) <span className="text-xs text-gray-500">(Opcional)</span></label>
                        <input type="number" step="0.1" name="waist" value={formData.waist} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                    </div>
                    <button type="submit" className="w-full md:w-auto bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-md transition-colors">Salvar</button>
                 </form>
            </div>
            {progress.length > 0 && (
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-cyan-400 mb-4">Histórico de Progresso</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="p-2 text-white">Data</th>
                                    <th className="p-2 text-white">Peso</th>
                                    <th className="p-2 text-white">Cintura</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...progress].sort((a,b) => b.date.seconds - a.date.seconds).map((entry, index) => (
                                    <tr key={entry.id || index} className="border-b border-gray-700 last:border-0">
                                        <td className="p-2 text-gray-300">{new Date(entry.date.seconds * 1000).toLocaleDateString('pt-BR')}</td>
                                        <td className="p-2 text-gray-300">{entry.weight.toFixed(1)} kg</td>
                                        <td className="p-2 text-gray-300">{entry.waist ? `${entry.waist.toFixed(1)} cm` : 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
             {progress.length > 1 && (
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-cyan-400 mb-3">Análise Inteligente</h3>
                    <p className="text-gray-300 mb-4">Peça ao seu assistente de IA para analisar seu progresso e te dar uma dica motivacional.</p>
                     <button 
                        onClick={handleAnalyzeProgress}
                        className="flex items-center justify-center gap-2 w-full md:w-auto bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-2 px-6 rounded-md transition-all"
                    >
                        <Sparkles className="w-5 h-5"/>
                        ✨ Analisar Meu Progresso
                    </button>
                </div>
             )}
        </div>
    );
};

export default function App() {
    const [view, setView] = useState('dashboard');
    const [user, setUser] = useState(null);
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalState, setModalState] = useState({ isOpen: false, type: '', content: '', isLoading: false });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDocRef = doc(db, `users/${firebaseUser.uid}`);
                const userDocSnap = await getDoc(userDocRef);
                const userData = {
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName,
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL,
                };
                if (userDocSnap.exists()) {
                    setUser({ ...userData, profile: userDocSnap.data() });
                } else {
                    setUser({ ...userData, profile: null });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user && user.uid) {
            const progressColRef = collection(db, `users/${user.uid}/progress`);
            const q = query(progressColRef);
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const progressData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProgress(progressData);
            });
            return () => unsubscribe();
        }
    }, [user]);

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Erro no login com Google: ", error);
            if (error.code === 'auth/unauthorized-domain') {
                console.error(
                    "--- AÇÃO NECESSÁRIA PARA O DESENVOLVEDOR ---\n" +
                    "O domínio deste aplicativo não está autorizado para autenticação no seu projeto Firebase.\n\n" +
                    "Para corrigir, siga estes passos:\n" +
                    "1. Vá para o seu Projeto no Firebase Console.\n" +
                    "2. No menu à esquerda, vá para 'Authentication'.\n" +
                    "3. Clique na aba 'Settings' (Configurações).\n" +
                    "4. Em 'Authorized domains' (Domínios autorizados), clique em 'Add domain' (Adicionar domínio).\n" +
                    "5. Adicione o seguinte domínio: " + window.location.hostname + "\n" +
                    "6. Clique em 'Add' e aguarde alguns minutos para a configuração propagar. Depois, tente fazer login novamente.\n\n" +
                    "Este passo é crucial para permitir que o Google se comunique com seu app de forma segura."
                );
            }
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setView('dashboard');
    };

    const calculateMetrics = (profileData) => {
        const { age, weight, height, activityLevel } = profileData;
        const bmr = 88.362 + (13.397 * parseFloat(weight)) + (4.799 * parseFloat(height)) - (5.677 * parseFloat(age));
        const tdee = bmr * parseFloat(activityLevel);
        const calorieTarget = tdee - 500;
        return {
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            calorieTarget: Math.round(calorieTarget),
            macros: {
                protein: Math.round((calorieTarget * 0.40) / 4),
                carbs: Math.round((calorieTarget * 0.30) / 4),
                fat: Math.round((calorieTarget * 0.30) / 9)
            }
        };
    };

    const handleSaveProfile = async (formData) => {
        if (!user) return;
        const profileData = {
            age: parseInt(formData.age),
            weight: parseFloat(formData.weight),
            height: parseInt(formData.height),
            activityLevel: parseFloat(formData.activityLevel),
        };
        const metrics = calculateMetrics(profileData);
        const fullProfile = { ...profileData, ...metrics };
        try {
            await setDoc(doc(db, `users/${user.uid}`), fullProfile);
            setUser(prev => ({ ...prev, profile: fullProfile }));
            const progressColRef = collection(db, `users/${user.uid}/progress`);
            const initialProgressSnap = await getDocs(query(progressColRef));
            if (initialProgressSnap.empty) {
                await handleAddProgress({ weight: profileData.weight, waist: null });
            }
            setView('dashboard');
        } catch (error) {
            console.error("Erro ao salvar perfil: ", error);
        }
    };

    const handleAddProgress = async (progressData) => {
        if (!user) return;
        try {
            await addDoc(collection(db, `users/${user.uid}/progress`), {
                weight: parseFloat(progressData.weight),
                waist: progressData.waist ? parseFloat(progressData.waist) : null,
                date: serverTimestamp()
            });
            const newMetrics = calculateMetrics({ ...user.profile, weight: progressData.weight });
            await setDoc(doc(db, `users/${user.uid}`), { weight: parseFloat(progressData.weight), ...newMetrics }, { merge: true });
            setUser(prev => ({...prev, profile: {...prev.profile, weight: parseFloat(progressData.weight), ...newMetrics}}));
        } catch (error) {
            console.error("Erro ao adicionar progresso: ", error);
        }
    };

    const handleModalAction = (action, payload) => {
        if (action === 'open') {
            setModalState({ 
                isOpen: true, 
                type: payload.type, 
                content: '', 
                isLoading: payload.isLoading 
            });
        } else if (action === 'update') {
            setModalState(prev => ({ ...prev, ...payload }));
        } else if (action === 'close') {
            setModalState({ isOpen: false, type: '', content: '', isLoading: false });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                <Dumbbell className="animate-spin w-12 h-12 text-cyan-500" />
            </div>
        )
    }

    if (!user) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    if (!user.profile) {
        return <ProfileSetup onSave={handleSaveProfile} />;
    }

    const renderView = () => {
        const props = { user, onModalAction };
        switch(view) {
            case 'dashboard': return <Dashboard {...props} />;
            case 'workout': return <WorkoutPlan {...props} />;
            case 'nutrition': return <NutritionPlan {...props} />;
            case 'progress': return <ProgressTracker {...props} progress={progress} onAddProgress={handleAddProgress} />;
            case 'profile': return <ProfileSetup onSave={handleSaveProfile} initialData={user.profile} isEditing={true} />;
            default: return <Dashboard {...props} />;
        }
    }

    const modalTitle = modalState.type === 'recipe' ? 'Receita da IA' : 'Análise de Progresso da IA';

    return (
        <div className="bg-gray-900 min-h-screen text-white font-sans">
            <GeminiModal 
                isOpen={modalState.isOpen}
                onClose={() => handleModalAction('close')}
                title={modalTitle}
                content={modalState.content}
                isLoading={modalState.isLoading}
            />
            <Header user={user} onNavigate={setView} onLogout={handleLogout} activeView={view} />
            <main className="container mx-auto p-4 md:p-6">
                {renderView()}
            </main>
        </div>
    );
}
