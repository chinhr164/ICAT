import { useState, useEffect } from 'react';
import { Calculator, Delete } from 'lucide-react';

export default function BasicCalc() {
  const [currentInput, setCurrentInput] = useState<string>('0');
  const [previousInput, setPreviousInput] = useState<string>('');
  const [operation, setOperation] = useState<string | null>(null);
  const [shouldResetDisplay, setShouldResetDisplay] = useState<boolean>(false);

  const appendNumber = (num: string) => {
    if (currentInput === '0' || shouldResetDisplay) {
      setCurrentInput(num === '.' ? '0.' : num);
      setShouldResetDisplay(false);
    } else {
      if (num === '.' && currentInput.includes('.')) return;
      setCurrentInput((prev) => prev + num);
    }
  };

  const appendOperator = (op: string) => {
    // If we already have an operation queued up, calculate first
    if (operation !== null && !shouldResetDisplay) {
      const prev = parseFloat(previousInput);
      const curr = parseFloat(currentInput);
      if (!isNaN(prev) && !isNaN(curr)) {
        let tempResult = 0;
        switch (operation) {
          case '+': tempResult = prev + curr; break;
          case '-': tempResult = prev - curr; break;
          case '*': tempResult = prev * curr; break;
          case '/': 
            if (curr !== 0) {
              tempResult = prev / curr;
            } else {
              setCurrentInput('Lỗi chia 0');
              setPreviousInput('');
              setOperation(null);
              setShouldResetDisplay(true);
              return;
            }
            break;
        }
        const formatted = parseFloat(tempResult.toFixed(8)).toString();
        setPreviousInput(formatted);
        setCurrentInput(formatted);
      }
    } else {
      setPreviousInput(currentInput);
    }
    
    setOperation(op);
    setShouldResetDisplay(true);
  };

  const clearDisplay = () => {
    setCurrentInput('0');
    setPreviousInput('');
    setOperation(null);
    setShouldResetDisplay(false);
  };

  const deleteLast = () => {
    if (shouldResetDisplay) {
      setCurrentInput('0');
      setShouldResetDisplay(false);
      return;
    }
    if (currentInput.length > 1) {
      setCurrentInput((prev) => prev.slice(0, -1));
    } else {
      setCurrentInput('0');
    }
  };

  const calculate = () => {
    let resultValue = 0;
    const prev = parseFloat(previousInput);
    const curr = parseFloat(currentInput);

    if (isNaN(prev) || isNaN(curr) || operation === null) return;

    switch (operation) {
      case '+':
        resultValue = prev + curr;
        break;
      case '-':
        resultValue = prev - curr;
        break;
      case '*':
        resultValue = prev * curr;
        break;
      case '/':
        if (curr === 0) {
          setCurrentInput('Lỗi chia 0');
          setOperation(null);
          setPreviousInput('');
          setShouldResetDisplay(true);
          return;
        }
        resultValue = prev / curr;
        break;
      default:
        return;
    }

    // round to fix floating point precision errors
    const finalResult = parseFloat(resultValue.toFixed(8)).toString();
    setCurrentInput(finalResult);
    setOperation(null);
    setPreviousInput('');
    setShouldResetDisplay(true);
  };

  // Keyboard support implementation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting input if the focus is on a text field (e.g., custom system date input in other tab)
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'SELECT') {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        appendNumber(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        appendNumber('.');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        deleteLast();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        clearDisplay();
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        e.preventDefault();
        appendOperator(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentInput, previousInput, operation, shouldResetDisplay]);

  return (
    <div id="basic-calc" className="w-full max-w-full sm:max-w-sm mx-auto space-y-4 sm:space-y-6">
      
      {/* Title & Introduction */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 flex items-center justify-center gap-2">
          <Calculator className="w-7 h-7 text-blue-600" />
          Máy tính cơ bản
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-xs mx-auto">
          Công cụ hỗ trợ các phép tính cơ học diễn ra nhanh chóng và chính xác tại quầy/kho bãi.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden p-3 sm:p-4 md:p-6">
        
        {/* Digital Display Area */}
        <div className="bg-neutral-50 rounded-xl p-3 sm:p-4 md:p-6 mb-4 flex flex-col items-end justify-end min-h-[88px] sm:min-h-[100px] border border-neutral-200/50 shadow-inner-sm">
          <div className="text-xs sm:text-sm text-neutral-400 font-mono h-5 truncate max-w-full text-right select-none">
            {operation ? `${previousInput} ${operation}` : ''}
          </div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight font-mono break-all text-right select-all mt-2 w-full">
            {currentInput}
          </div>
        </div>

        {/* Buttons Grid layout */}
        <div className="grid grid-cols-4 gap-2.5">
          {/* Row 1: AC, /, *, Back */}
          <button 
            onClick={clearDisplay}
            className="h-12 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-sm rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            AC
          </button>
          <button 
            onClick={() => appendOperator('/')}
            className="h-12 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            ÷
          </button>
          <button 
            onClick={() => appendOperator('*')}
            className="h-12 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            ×
          </button>
          <button 
            onClick={deleteLast}
            className="h-12 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>

          {/* Row 2: 7, 8, 9, - */}
          <button 
            onClick={() => appendNumber('7')}
            className="h-12 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 font-bold text-sm rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            7
          </button>
          <button 
            onClick={() => appendNumber('8')}
            className="h-12 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 font-bold text-sm rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            8
          </button>
          <button 
            onClick={() => appendNumber('9')}
            className="h-12 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 font-bold text-sm rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            9
          </button>
          <button 
            onClick={() => appendOperator('-')}
            className="h-12 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            -
          </button>

          {/* Row 3: 4, 5, 6, + */}
          <button 
            onClick={() => appendNumber('4')}
            className="h-12 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 font-bold text-sm rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            4
          </button>
          <button 
            onClick={() => appendNumber('5')}
            className="h-12 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 font-bold text-sm rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            5
          </button>
          <button 
            onClick={() => appendNumber('6')}
            className="h-12 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 font-bold text-sm rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            6
          </button>
          <button 
            onClick={() => appendOperator('+')}
            className="h-12 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            +
          </button>

          {/* Row 4: 1, 2, 3 space, with = tall button on right */}
          <div className="col-span-3 grid grid-cols-3 gap-2.5">
            <button 
              onClick={() => appendNumber('1')}
              className="h-12 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 font-bold text-sm rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            >
              1
            </button>
            <button 
              onClick={() => appendNumber('2')}
              className="h-12 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 font-bold text-sm rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            >
              2
            </button>
            <button 
              onClick={() => appendNumber('3')}
              className="h-12 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 font-bold text-sm rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            >
              3
            </button>
          </div>
          
          <button 
            onClick={calculate}
            className="row-span-2 h-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xl rounded-lg active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center"
          >
            =
          </button>

          {/* Row 5: 0 (span 2), . */}
          <button 
            onClick={() => appendNumber('0')}
            className="col-span-2 h-12 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 font-bold text-sm rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            0
          </button>
          <button 
            onClick={() => appendNumber('.')}
            className="h-12 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 font-bold text-sm rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            .
          </button>
        </div>
      </div>
    </div>
  );
}
