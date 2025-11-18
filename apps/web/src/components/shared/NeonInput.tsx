import { Input } from '../ui/input';

interface NeonInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function NeonInput({ 
  value, 
  onChange, 
  placeholder = '', 
  type = 'text',
  maxLength,
  className = '',
  onKeyDown
}: NeonInputProps) {
  return (
    <>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        maxLength={maxLength}
        className={`neon-input ${className}`}
        style={{ fontFamily: 'Orbitron, sans-serif' }}
      />

      <style>{`
        .neon-input {
          background: rgba(0, 0, 0, 0.4);
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          color: white;
          height: 48px;
          border-radius: 8px;
          padding: 0 16px;
          font-family: 'Orbitron', sans-serif;
          transition: all 0.3s ease;
        }

        .neon-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .neon-input:focus {
          outline: none;
          border-color: rgba(0, 255, 255, 0.6);
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
          background: rgba(0, 0, 0, 0.5);
        }

        .neon-input:hover {
          border-color: rgba(255, 255, 255, 0.25);
        }
      `}</style>
    </>
  );
}
