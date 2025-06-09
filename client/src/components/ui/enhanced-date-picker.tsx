import { useState, useRef, useEffect } from "react";
import { format, parse, isValid, startOfYear, endOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface EnhancedDatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  className?: string;
  maxDate?: Date;
  minDate?: Date;
}

export function EnhancedDatePicker({
  value,
  onChange,
  placeholder = "Selecione a data",
  disabled,
  className,
  maxDate,
  minDate
}: EnhancedDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [displayMonth, setDisplayMonth] = useState<Date>(value || new Date());
  const inputRef = useRef<HTMLInputElement>(null);

  // Atualizar o valor do input quando o valor da data mudar
  useEffect(() => {
    if (value) {
      setInputValue(format(value, "dd/MM/yyyy"));
    } else {
      setInputValue("");
    }
  }, [value]);

  // Função para lidar com mudanças no input de texto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Tentar fazer parse da data conforme o usuário digita
    if (newValue.length === 10) { // dd/MM/yyyy
      const parsedDate = parse(newValue, "dd/MM/yyyy", new Date());
      if (isValid(parsedDate)) {
        // Verificar se a data está dentro dos limites permitidos
        if ((!minDate || parsedDate >= minDate) && 
            (!maxDate || parsedDate <= maxDate) &&
            (!disabled || !disabled(parsedDate))) {
          onChange?.(parsedDate);
          setDisplayMonth(parsedDate);
        }
      }
    }
  };

  // Função para lidar com teclas especiais
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir apenas números, barras e teclas de controle
    if (!/[\d\/]/.test(e.key) && 
        !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
      e.preventDefault();
    }

    // Auto-formatação: adicionar barras automaticamente
    if (e.key >= '0' && e.key <= '9') {
      const currentValue = inputValue;
      const cursorPos = (e.target as HTMLInputElement).selectionStart || 0;
      
      // Adicionar barra após o dia (posição 2)
      if (currentValue.length === 2 && cursorPos === 2 && !currentValue.includes('/')) {
        setInputValue(currentValue + '/');
      }
      // Adicionar barra após o mês (posição 5)
      else if (currentValue.length === 5 && cursorPos === 5 && currentValue.split('/').length === 2) {
        setInputValue(currentValue + '/');
      }
    }

    // Navegar no calendário com setas quando o popover estiver aberto
    if (open && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      // Aqui você pode implementar navegação por teclado no calendário se necessário
    }

    // Fechar popover com Escape
    if (e.key === 'Escape') {
      setOpen(false);
    }

    // Abrir popover com Enter ou espaço
    if ((e.key === 'Enter' || e.key === ' ') && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  // Função para lidar com seleção de data no calendário
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onChange?.(date);
      setInputValue(format(date, "dd/MM/yyyy"));
      setOpen(false);
    }
  };

  // Função para navegação rápida por anos
  const handleYearNavigation = (year: number) => {
    const newDate = new Date(year, displayMonth.getMonth(), 1);
    setDisplayMonth(newDate);
  };

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
            className="pr-20 border-primary bg-dark text-parchment placeholder:text-parchment-dark focus:border-accent focus:ring-accent"
            maxLength={10}
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-full px-3 py-2 hover:bg-dark-light text-parchment"
                onClick={() => setOpen(!open)}
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
          </div>
        </div>

        <PopoverContent 
          className="w-auto p-0 border-primary bg-dark" 
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="p-3 border-b border-primary/40">
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 bg-transparent p-0 text-parchment border-primary hover:bg-dark-light"
                onClick={() => {
                  const newYear = displayMonth.getFullYear() - 1;
                  handleYearNavigation(newYear);
                }}
              >
                -
              </Button>
              <div className="text-sm font-medium text-parchment min-w-[80px] text-center">
                {displayMonth.getFullYear()}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 bg-transparent p-0 text-parchment border-primary hover:bg-dark-light"
                onClick={() => {
                  const newYear = displayMonth.getFullYear() + 1;
                  handleYearNavigation(newYear);
                }}
              >
                +
              </Button>
            </div>
          </div>
          
          <CalendarComponent
            mode="single"
            selected={value}
            onSelect={handleCalendarSelect}
            disabled={disabled}
            month={displayMonth}
            onMonthChange={setDisplayMonth}
            locale={ptBR}
            className="bg-dark text-parchment border-0"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium text-parchment",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 text-parchment hover:bg-dark-light border border-primary",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-parchment-dark rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-9 w-9 p-0 font-normal text-parchment hover:bg-dark-light rounded-md",
              day_selected: "bg-accent text-white hover:bg-accent hover:text-white focus:bg-accent focus:text-white",
              day_today: "bg-dark-light text-accent font-semibold",
              day_outside: "text-parchment-dark opacity-50",
              day_disabled: "text-parchment-dark opacity-50 cursor-not-allowed",
              day_hidden: "invisible",
            }}
          />
          
          <div className="p-3 border-t border-primary/40">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-parchment border-primary hover:bg-dark-light"
                onClick={() => {
                  const today = new Date();
                  if ((!minDate || today >= minDate) && 
                      (!maxDate || today <= maxDate) &&
                      (!disabled || !disabled(today))) {
                    handleCalendarSelect(today);
                  }
                }}
              >
                Hoje
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-parchment hover:bg-dark-light"
                onClick={() => {
                  onChange?.(undefined);
                  setInputValue("");
                  setOpen(false);
                }}
              >
                Limpar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}