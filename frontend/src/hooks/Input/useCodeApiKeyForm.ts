import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';

interface CodeApiKeyFormValues {
  apiKey: string;
}

interface UseCodeApiKeyFormOptions {
  // Add any options here if needed
}

interface UseCodeApiKeyFormReturn {
  methods: ReturnType<typeof useForm<CodeApiKeyFormValues>>;
  onSubmit: (data: CodeApiKeyFormValues) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  handleRevokeApiKey: () => void;
}

export const useCodeApiKeyForm = (options: UseCodeApiKeyFormOptions = {}): UseCodeApiKeyFormReturn => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const methods = useForm<CodeApiKeyFormValues>({
    defaultValues: {
      apiKey: '',
    },
  });

  const onSubmit = useCallback((data: CodeApiKeyFormValues) => {
    // Handle API key submission
    console.log('API Key submitted:', data.apiKey);
    // You can add actual API key handling logic here
    setIsDialogOpen(false);
  }, []);

  const handleRevokeApiKey = useCallback(() => {
    // Handle API key revocation
    console.log('API Key revoked');
    // You can add actual revocation logic here
  }, []);

  return {
    methods,
    onSubmit,
    isDialogOpen,
    setIsDialogOpen,
    handleRevokeApiKey,
  };
};

export default useCodeApiKeyForm;
