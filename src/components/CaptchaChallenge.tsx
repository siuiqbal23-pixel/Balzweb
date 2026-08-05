import React, { useState, useEffect } from 'react';
import { RefreshCw, ShieldCheck, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

interface CaptchaChallengeProps {
  onVerifiedChange: (isVerified: boolean) => void;
  resetTrigger?: number;
}

export const CaptchaChallenge: React.FC<CaptchaChallengeProps> = ({
  onVerifiedChange,
  resetTrigger = 0,
}) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState<'+' | '-' | 'x'>('+');
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [codeCaptcha, setCodeCaptcha] = useState('');

  // Generate a random math challenge & visual code
  const generateNewChallenge = () => {
    const ops: ('+' | '-' | 'x')[] = ['+', '-', 'x'];
    const selectedOp = ops[Math.floor(Math.random() * ops.length)];
    let n1 = 0;
    let n2 = 0;

    if (selectedOp === '+') {
      n1 = Math.floor(Math.random() * 20) + 5;
      n2 = Math.floor(Math.random() * 15) + 2;
    } else if (selectedOp === '-') {
      n1 = Math.floor(Math.random() * 30) + 15;
      n2 = Math.floor(Math.random() * 14) + 1;
    } else {
      n1 = Math.floor(Math.random() * 9) + 2;
      n2 = Math.floor(Math.random() * 8) + 2;
    }

    setNum1(n1);
    setNum2(n2);
    setOperator(selectedOp);

    // Random 4-character alphanumeric code string for visual verification
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCodeCaptcha(code);

    setUserAnswer('');
    setIsVerified(false);
    setErrorMsg('');
    onVerifiedChange(false);
  };

  useEffect(() => {
    generateNewChallenge();
  }, [resetTrigger]);

  const getExpectedResult = (): number => {
    if (operator === '+') return num1 + num2;
    if (operator === '-') return num1 - num2;
    return num1 * num2;
  };

  const handleVerify = (val: string) => {
    setUserAnswer(val);
    const expectedNum = getExpectedResult();
    const parsed = parseInt(val.trim(), 10);

    if (!isNaN(parsed) && parsed === expectedNum) {
      setIsVerified(true);
      setErrorMsg('');
      onVerifiedChange(true);
    } else {
      setIsVerified(false);
      onVerifiedChange(false);
      if (val.trim().length > 0 && !isNaN(parsed) && parsed !== expectedNum) {
        setErrorMsg('Jawapan CAPTCHA tidak tepat. Sila cuba lagi.');
      } else {
        setErrorMsg('');
      }
    }
  };

  return (
    <div className="p-4 bg-[#0D1117] border border-orange-500/40 rounded-2xl space-y-3 shadow-inner">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-500/20 text-orange-400 rounded-lg border border-orange-500/30">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <span>Pengesahan Keselamatan CAPTCHA</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                Anti-Bot Active
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">
              Selesaikan kiraan matematik mudah di bawah untuk mengesahkan anda manusia.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={generateNewChallenge}
          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-all cursor-pointer"
          title="Tukar Soalan CAPTCHA"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Math Challenge Visual Box */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-slate-900 via-[#161D2E] to-slate-900 border border-slate-700/80 rounded-xl text-center flex items-center justify-center gap-2 select-none shadow-md">
          <span className="font-mono text-lg font-black text-orange-400 tracking-wider">
            {num1} {operator === 'x' ? '×' : operator} {num2} = ?
          </span>
          <span className="text-xs font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
            {codeCaptcha}
          </span>
        </div>

        {/* Input Field */}
        <div className="relative flex-1 w-full sm:w-auto">
          <input
            type="number"
            required
            placeholder="Jawapan kiraan..."
            value={userAnswer}
            onChange={(e) => handleVerify(e.target.value)}
            className={`w-full bg-[#121824] border rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none transition-all ${
              isVerified
                ? 'border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/30'
                : errorMsg
                ? 'border-rose-500/80 focus:ring-2 focus:ring-rose-500/30'
                : 'border-slate-700 focus:border-orange-500'
            }`}
          />
          {isVerified && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
              <span>Disahkan ✓</span>
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <p className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </p>
      )}
    </div>
  );
};
