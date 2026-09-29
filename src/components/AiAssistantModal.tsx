import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Bot,
  Send,
  Sparkles,
  User,
  Copy,
  Check,
  RotateCcw,
  Lightbulb,
  Building2,
  Stethoscope,
  TrendingDown,
  ShieldAlert,
} from 'lucide-react';
import { Department, FinancialSummary, MixerParams } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  financialSummary: FinancialSummary;
  params: MixerParams;
  onDiagnoseDept?: (dept: Department) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const PRESET_PROMPTS = [
  '请分析当前全院统一点值从12.42微调至13.15的原因，如何防范科室异议？',
  '为什么骨科在药耗剔除后绩效出现负增长(-8.3%)？如何通过调音台进行合理补偿？',
  '儿科与急诊科在RBRVS点数法下常常吃亏，系统是如何通过战略系数和班次覆盖法进行保障的？',
  '公立医院国考56项指标中，CMI值与微创手术如何与质量绩效池实现无缝联动？',
  '定岗定编中的“工作量法”与“班次覆盖法”有何本质区别？如何向院党委会汇报？',
];

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  departments,
  financialSummary,
  params,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `您好！我是您的 **公立医院绩效改革与定岗定编AI首席咨询顾问**。
我可以为您解答：
1. **RBRVS + CCHI标尺映射**与无收费诊疗劳动的点数折算；
2. **四大绩效池切分与点值反推**的数学逻辑；
3. **定岗定编（FTE全时当量）**工作量法与班次覆盖法的落地方案；
4. **调音台防断崖**（88%保底与125%封顶保护线）与科室沟通心理建设；
5. 国考指标（CMI、三四级手术比例）如何通过质量绩效池进行精准诱导。

您可以直接在下方提问，或点击上方推荐的热点管理话题开始探讨！`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build lightweight context for AI
      const context = {
        effectiveIncome: financialSummary.effectiveIncome,
        totalBonusPool: financialSummary.totalBonusPool,
        predictedPointValue: financialSummary.predictedPointValue,
        baselinePointValue: financialSummary.baselinePointValue,
        mixerParams: params,
        departmentCount: departments.length,
        floorDepartments: departments
          .filter((d) => d.isFloorTriggered)
          .map((d) => `${d.name} (${d.changeRate}%)`),
        capDepartments: departments
          .filter((d) => d.isCapTriggered)
          .map((d) => `${d.name} (${d.changeRate}%)`),
      };

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          context,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error(data.error || '未返回有效回复');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `AI专家顾问暂时无法连通（${err.message}）。公立医院绩效改革核心在于“保底平稳、增量优劳、人岗匹配”，建议您检查调音台中的保底线设置。`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-center items-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col h-[90vh] text-slate-100 overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg ring-2 ring-purple-500/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  MediScale AI 绩效改革首席咨询顾问
                </h3>
                <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded-full border border-purple-800 font-mono font-medium">
                  Gemini 3.8 旗舰模型
                </span>
              </div>
              <p className="text-xs text-slate-400">
                实时贯通当前沙盘测算数据，提供三甲公立医院顶级绩效设计与落地方案解答
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-slate-950/60 border-b border-slate-800/80 px-4 py-2.5 overflow-x-auto">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              常见咨询焦点:
            </span>
            <div className="flex gap-2">
              {PRESET_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-full text-xs whitespace-nowrap border border-slate-700 transition-colors"
                >
                  {prompt.length > 25 ? prompt.slice(0, 25) + '...' : prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  m.role === 'user'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-purple-900/80 text-purple-200 border border-purple-700'
                }`}
              >
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-cyan-700/80 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-200 rounded-tl-none border border-slate-700 shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 text-[10px] text-slate-400">
                  <span>{m.role === 'user' ? '管理者' : 'AI 改革顾问'}</span>
                  <div className="flex items-center gap-2">
                    <span>{m.timestamp}</span>
                    {m.role === 'assistant' && (
                      <button
                        onClick={() => handleCopy(m.content, m.id)}
                        className="hover:text-white transition-colors"
                        title="复制内容"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="whitespace-pre-wrap font-sans text-xs space-y-2">
                  {m.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-900/80 text-purple-200 border border-purple-700 flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl rounded-tl-none p-4 text-xs text-purple-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
                <span>AI专家正在研判全院沙盘数据与政策规范，组织精炼解答...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="请输入您的绩效改革疑问、调音台平衡建议或科室心理沟通策略..."
              disabled={loading}
              className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-500 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>发送</span>
            </button>
          </form>
          <div className="flex justify-between items-center mt-2 text-[10px] text-slate-500">
            <span>支持针对具体科室（如“请诊断胃肠外科”或“请为急诊科出具沟通话术”）进行一对一定制解答</span>
            <button
              onClick={() =>
                setMessages([
                  {
                    id: 'welcome_reset',
                    role: 'assistant',
                    content: '对话已清空。您可以随时提出新的绩效改革、测算逻辑与定岗定编问题。',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ])
              }
              className="hover:text-slate-300 flex items-center gap-1"
            >
              <RotateCcw className="w-2.5 h-2.5" /> 清空历史
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
