import React, { useState } from 'react';
import { X, Calculator, Delete, RotateCcw } from 'lucide-react';

interface RealCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RealCalculatorModal: React.FC<RealCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [equation, setEquation] = useState<string>('');
  const [isNewInput, setIsNewInput] = useState<boolean>(true);

  if (!isOpen) return null;

  // Handle digit press (0-9)
  const handleDigit = (digit: string) => {
    if (displayValue === '0' || isNewInput) {
      setDisplayValue(digit);
      setIsNewInput(false);
    } else {
      // Limit length to 12 digits
      if (displayValue.replace(/,/g, '').length < 12) {
        setDisplayValue(displayValue + digit);
      }
    }
  };

  // Handle decimal point
  const handleDecimal = () => {
    if (isNewInput) {
      setDisplayValue('0.');
      setIsNewInput(false);
    } else if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  // Handle operator (+, -, ×, ÷)
  const handleOperator = (op: string) => {
    const currentNum = parseFloat(displayValue);
    if (isNaN(currentNum)) return;

    if (equation && !isNewInput) {
      // Evaluate previous if chained
      const evaluated = evaluateEquation(`${equation} ${displayValue}`);
      setEquation(`${evaluated} ${op}`);
      setDisplayValue(String(evaluated));
    } else {
      setEquation(`${displayValue} ${op}`);
    }
    setIsNewInput(true);
  };

  // Handle Percentage
  const handlePercentage = () => {
    const currentNum = parseFloat(displayValue);
    if (isNaN(currentNum)) return;
    const result = currentNum / 100;
    setDisplayValue(String(result));
    setIsNewInput(true);
  };

  // Handle Toggle Sign (+/-)
  const handleToggleSign = () => {
    const currentNum = parseFloat(displayValue);
    if (isNaN(currentNum) || currentNum === 0) return;
    setDisplayValue(String(currentNum * -1));
  };

  // Handle Backspace (delete last character)
  const handleBackspace = () => {
    if (isNewInput) return;
    if (displayValue.length > 1) {
      setDisplayValue(displayValue.slice(0, -1));
    } else {
      setDisplayValue('0');
      setIsNewInput(true);
    }
  };

  // Handle Clear All (AC)
  const handleClear = () => {
    setDisplayValue('0');
    setEquation('');
    setIsNewInput(true);
  };

  // Safe equation evaluator helper
  const evaluateEquation = (expr: string): number => {
    try {
      const sanitized = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/,/g, '');
      
      // Basic safe calculation
      const tokens = sanitized.trim().split(/\s+/);
      if (tokens.length < 3) return parseFloat(displayValue) || 0;

      let result = parseFloat(tokens[0]);
      for (let i = 1; i < tokens.length; i += 2) {
        const op = tokens[i];
        const nextNum = parseFloat(tokens[i + 1]);
        if (isNaN(nextNum)) break;

        if (op === '+') result += nextNum;
        else if (op === '-') result -= nextNum;
        else if (op === '*') result *= nextNum;
        else if (op === '/') {
          if (nextNum === 0) return 0;
          result /= nextNum;
        }
      }

      // Round to 8 decimal places to avoid floating point precision quirks
      return Math.round(result * 100000000) / 100000000;
    } catch {
      return 0;
    }
  };

  // Handle Equals (=)
  const handleEquals = () => {
    if (!equation) return;
    const fullExpr = `${equation} ${displayValue}`;
    const result = evaluateEquation(fullExpr);

    setEquation(`${fullExpr} =`);
    setDisplayValue(String(result));
    setIsNewInput(true);
  };

  // Format large numbers with commas for display if not carrying trailing decimal
  const formatDisplay = (val: string) => {
    if (val === 'Error') return 'Error';
    if (val.endsWith('.')) return val;
    const parts = val.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

    if (!isNaN(Number(integerPart))) {
      return Number(integerPart).toLocaleString('en-US') + decimalPart;
    }
    return val;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#030611]/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xs sm:max-w-sm bg-[#0a0f24] border border-blue-500/30 rounded-3xl shadow-[0_0_50px_rgba(37,99,235,0.3)] overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-blue-900/50 bg-[#060a1d]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-wide uppercase">Kalkulator</h3>
              <p className="text-[10px] text-blue-300/70 font-medium">Standard Calculator Tool</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Digital Calculator Screen */}
        <div className="p-5 bg-gradient-to-b from-[#050814] to-[#0d1433] border-b border-blue-900/40 text-right space-y-1">
          {/* History equation line */}
          <div className="h-6 text-xs font-mono text-blue-400/80 overflow-x-auto whitespace-nowrap tracking-wider">
            {equation || '\u00A0'}
          </div>

          {/* Main output display */}
          <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight overflow-x-auto whitespace-nowrap scrollbar-none py-1">
            {formatDisplay(displayValue)}
          </div>
        </div>

        {/* Keypad Grid */}
        <div className="p-4 grid grid-cols-4 gap-2 bg-[#080d21]">
          {/* Row 1 */}
          <button
            onClick={handleClear}
            className="py-3.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-black text-sm active:scale-95 transition-all cursor-pointer"
          >
            AC
          </button>
          <button
            onClick={handleToggleSign}
            className="py-3.5 rounded-2xl bg-blue-900/40 hover:bg-blue-800/50 border border-blue-700/40 text-blue-300 font-black text-sm active:scale-95 transition-all cursor-pointer"
          >
            ±
          </button>
          <button
            onClick={handlePercentage}
            className="py-3.5 rounded-2xl bg-blue-900/40 hover:bg-blue-800/50 border border-blue-700/40 text-blue-300 font-black text-sm active:scale-95 transition-all cursor-pointer"
          >
            %
          </button>
          <button
            onClick={() => handleOperator('÷')}
            className="py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg active:scale-95 transition-all cursor-pointer shadow-md shadow-blue-600/30"
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleDigit('7')}
            className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-black text-lg active:scale-95 transition-all cursor-pointer"
          >
            7
          </button>
          <button
            onClick={() => handleDigit('8')}
            className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-black text-lg active:scale-95 transition-all cursor-pointer"
          >
            8
          </button>
          <button
            onClick={() => handleDigit('9')}
            className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-black text-lg active:scale-95 transition-all cursor-pointer"
          >
            9
          </button>
          <button
            onClick={() => handleOperator('×')}
            className="py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg active:scale-95 transition-all cursor-pointer shadow-md shadow-blue-600/30"
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleDigit('4')}
            className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-black text-lg active:scale-95 transition-all cursor-pointer"
          >
            4
          </button>
          <button
            onClick={() => handleDigit('5')}
            className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-black text-lg active:scale-95 transition-all cursor-pointer"
          >
            5
          </button>
          <button
            onClick={() => handleDigit('6')}
            className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-black text-lg active:scale-95 transition-all cursor-pointer"
          >
            6
          </button>
          <button
            onClick={() => handleOperator('-')}
            className="py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg active:scale-95 transition-all cursor-pointer shadow-md shadow-blue-600/30"
          >
            -
          </button>

          {/* Row 4 */}
          <button
            onClick={() => handleDigit('1')}
            className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-black text-lg active:scale-95 transition-all cursor-pointer"
          >
            1
          </button>
          <button
            onClick={() => handleDigit('2')}
            className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-black text-lg active:scale-95 transition-all cursor-pointer"
          >
            2
          </button>
          <button
            onClick={() => handleDigit('3')}
            className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-black text-lg active:scale-95 transition-all cursor-pointer"
          >
            3
          </button>
          <button
            onClick={() => handleOperator('+')}
            className="py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg active:scale-95 transition-all cursor-pointer shadow-md shadow-blue-600/30"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={() => handleDigit('0')}
            className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-black text-lg active:scale-95 transition-all cursor-pointer"
          >
            0
          </button>
          <button
            onClick={handleDecimal}
            className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-black text-lg active:scale-95 transition-all cursor-pointer"
          >
            .
          </button>
          <button
            onClick={handleBackspace}
            className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-black flex items-center justify-center active:scale-95 transition-all cursor-pointer"
            title="Padam"
          >
            <Delete className="w-5 h-5 text-slate-300" />
          </button>
          <button
            onClick={handleEquals}
            className="py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xl active:scale-95 transition-all cursor-pointer shadow-lg shadow-amber-500/30"
          >
            =
          </button>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[#050814] border-t border-blue-900/40 text-center">
          <p className="text-[10px] text-slate-400 font-mono">
            ⚡ TopupBalz Real Pocket Calculator
          </p>
        </div>

      </div>
    </div>
  );
};
