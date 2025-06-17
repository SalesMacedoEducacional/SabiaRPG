import React, { useEffect, useState } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';
import { Check, X, Loader2 } from 'lucide-react';
import { useUnicityValidation } from '@/hooks/useUnicityValidation';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fieldName: string;
  validationType?: 'cpf' | 'email' | 'telefone';
  onValidationChange?: (isValid: boolean) => void;
  showValidationIcon?: boolean;
  debounceMs?: number;
}

export const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ 
    fieldName, 
    validationType, 
    onValidationChange, 
    showValidationIcon = true,
    debounceMs = 800,
    className,
    onBlur,
    onChange,
    value,
    ...props 
  }, ref) => {
    const { 
      validateField, 
      isFieldValid, 
      hasValidationError, 
      isValidating, 
      getErrorMessage, 
      getSuccessMessage,
      clearValidation 
    } = useUnicityValidation();
    
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
    const [currentValue, setCurrentValue] = useState(String(value || ''));

    // Limpar validação quando o componente é desmontado
    useEffect(() => {
      return () => {
        if (validationType) {
          clearValidation(validationType);
        }
      };
    }, [validationType, clearValidation]);

    // Notificar mudanças de validação
    useEffect(() => {
      if (validationType && onValidationChange) {
        onValidationChange(isFieldValid(validationType));
      }
    }, [isFieldValid, validationType, onValidationChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setCurrentValue(newValue);
      
      // Chamar onChange original se fornecido
      if (onChange) {
        onChange(e);
      }

      // Limpar timeout anterior
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      // Se há tipo de validação e valor não está vazio, validar após delay
      if (validationType && newValue.trim() !== '') {
        const timeout = setTimeout(() => {
          validateField(validationType, newValue);
        }, debounceMs);
        setDebounceTimeout(timeout);
      } else if (validationType) {
        // Limpar validação se campo está vazio
        clearValidation(validationType);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Chamar onBlur original se fornecido
      if (onBlur) {
        onBlur(e);
      }

      // Validar imediatamente no blur se há valor
      if (validationType && currentValue.trim() !== '') {
        validateField(validationType, currentValue);
      }
    };

    const getValidationState = () => {
      if (!validationType || !currentValue.trim()) return null;
      
      if (isValidating(validationType)) return 'validating';
      if (isFieldValid(validationType)) return 'valid';
      if (hasValidationError(validationType)) return 'error';
      return null;
    };

    const validationState = getValidationState();

    const getInputClassName = () => {
      let classes = className || '';
      
      if (validationState === 'valid') {
        classes += ' border-green-500 focus:border-green-500';
      } else if (validationState === 'error') {
        classes += ' border-red-500 focus:border-red-500';
      }
      
      return classes;
    };

    const renderValidationIcon = () => {
      if (!showValidationIcon || !validationType || !currentValue.trim()) return null;

      switch (validationState) {
        case 'validating':
          return <Loader2 className="h-4 w-4 animate-spin text-gray-500" />;
        case 'valid':
          return <Check className="h-4 w-4 text-green-500" />;
        case 'error':
          return <X className="h-4 w-4 text-red-500" />;
        default:
          return null;
      }
    };

    const renderValidationMessage = () => {
      if (!validationType || !currentValue.trim()) return null;

      if (validationState === 'valid') {
        return (
          <p className="text-sm text-green-600 mt-1">
            {getSuccessMessage(validationType)}
          </p>
        );
      } else if (validationState === 'error') {
        return (
          <p className="text-sm text-red-600 mt-1">
            {getErrorMessage(validationType)}
          </p>
        );
      }

      return null;
    };

    return (
      <div className="space-y-1">
        <div className="relative">
          <Input
            {...props}
            ref={ref}
            value={currentValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(getInputClassName(), showValidationIcon && "pr-10")}
          />
          {showValidationIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {renderValidationIcon()}
            </div>
          )}
        </div>
        {renderValidationMessage()}
      </div>
    );
  }
);

ValidatedInput.displayName = "ValidatedInput";