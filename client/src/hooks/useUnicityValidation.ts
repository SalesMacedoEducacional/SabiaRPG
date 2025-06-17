import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface ValidationState {
  [key: string]: {
    isValidating: boolean;
    isValid: boolean | null;
    error: string | null;
  };
}

export const useUnicityValidation = () => {
  const [validationState, setValidationState] = useState<ValidationState>({});

  const validateField = useCallback(async (campo: string, valor: string) => {
    if (!valor || valor.trim() === '') {
      setValidationState(prev => ({
        ...prev,
        [campo]: {
          isValidating: false,
          isValid: null,
          error: null
        }
      }));
      return;
    }

    // Iniciar validação
    setValidationState(prev => ({
      ...prev,
      [campo]: {
        isValidating: true,
        isValid: null,
        error: null
      }
    }));

    try {
      const response = await apiRequest('POST', '/api/usuarios/verificar-unicidade', {
        campo,
        valor
      });

      const { disponivel } = response as { disponivel: boolean };

      setValidationState(prev => ({
        ...prev,
        [campo]: {
          isValidating: false,
          isValid: disponivel,
          error: disponivel ? null : getErrorMessage(campo)
        }
      }));

      return disponivel;

    } catch (error: any) {
      console.error('Erro na validação de unicidade:', error);
      
      setValidationState(prev => ({
        ...prev,
        [campo]: {
          isValidating: false,
          isValid: false,
          error: 'Erro ao verificar disponibilidade'
        }
      }));

      return false;
    }
  }, []);

  const getErrorMessage = (campo: string): string => {
    switch (campo) {
      case 'cpf':
        return 'CPF já cadastrado no sistema';
      case 'email':
        return 'E-mail já cadastrado no sistema';
      case 'telefone':
        return 'Telefone já cadastrado no sistema';
      default:
        return 'Valor já cadastrado no sistema';
    }
  };

  const getSuccessMessage = (campo: string): string => {
    switch (campo) {
      case 'cpf':
        return 'CPF disponível';
      case 'email':
        return 'E-mail disponível';
      case 'telefone':
        return 'Telefone disponível';
      default:
        return 'Disponível';
    }
  };

  const clearValidation = useCallback((campo?: string) => {
    if (campo) {
      setValidationState(prev => ({
        ...prev,
        [campo]: {
          isValidating: false,
          isValid: null,
          error: null
        }
      }));
    } else {
      setValidationState({});
    }
  }, []);

  const isFieldValid = useCallback((campo: string): boolean => {
    const state = validationState[campo];
    return state?.isValid === true;
  }, [validationState]);

  const hasValidationError = useCallback((campo: string): boolean => {
    const state = validationState[campo];
    return state?.isValid === false;
  }, [validationState]);

  const isValidating = useCallback((campo: string): boolean => {
    const state = validationState[campo];
    return state?.isValidating === true;
  }, [validationState]);

  const allFieldsValid = useCallback((campos: string[]): boolean => {
    return campos.every(campo => isFieldValid(campo));
  }, [isFieldValid]);

  return {
    validateField,
    clearValidation,
    isFieldValid,
    hasValidationError,
    isValidating,
    allFieldsValid,
    getErrorMessage,
    getSuccessMessage,
    validationState
  };
};