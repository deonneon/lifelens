// Component type declarations
declare module './InputForm' {
  import { FC } from 'react';
  
  interface InputFormProps {
    onSubmit: (text: string) => void;
    isLoading: boolean;
  }
  
  const InputForm: FC<InputFormProps>;
  export default InputForm;
}

declare module './BiographySummary' {
  import { FC } from 'react';
  
  interface BiographySummaryProps {
    bio: string;
  }
  
  const BiographySummary: FC<BiographySummaryProps>;
  export default BiographySummary;
}

declare module './SaveLoadPanel' {
  import { FC } from 'react';
  
  interface SaveLoadPanelProps {
    onSave: (name: string) => void;
    onLoad: (id: string) => void;
    onClear: () => void;
    hasBiography: boolean;
  }
  
  const SaveLoadPanel: FC<SaveLoadPanelProps>;
  export default SaveLoadPanel;
} 